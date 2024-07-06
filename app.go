package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"time"

	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
	"github.com/adrg/xdg"
	"github.com/gocarina/gocsv"
)

const AppPrefix = "gardyn_fleet_app"
const EVENT_DEVICES_LIST = "devicesList"

const OTA_DEVICE_TABLE = "gOtaDevices"

// device as stored in csv file
type DeviceOta struct {
	AppVersion       string `csv:"app_version"`
	AzureDeviceId    string `csv:"azure_device_id"`
	HwProfile        string `csv:"hw_profile"`
	IsEmployeeDevice bool   `csv:"is_employee_device"`
	LastActionSent   string `csv:"last_action_sent"`
	Note             string `csv:"note"`
}

type DeviceOtaMeta struct {
	LastUpdateDate   string `csv:"last_update_date"`
	NbDevices        int32  `csv:"nb_devices"`
	DownloadDuration int32  `csv:"download_duration"`
	DeviceCsvPath         string `csv:"_"`
	DeviceMetaCsvPath         string `csv:"_"`
	Message          string `csv:""`
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) OperatingSystem() string {
	os := runtime.GOOS
	return os
}

func (a *App) DataDirectory() string {
	path := filepath.Join(xdg.UserDirs.Documents, AppPrefix)
	return path
}

type OtaDevicesFilter struct {
	AppVersion          string
	HwProfile           string
	LastOtaAction       string
	OnlyEmployeeDevices bool
}

func (a *App) GetDevicesListStatus() DeviceOtaMeta {
	deviceFilePath := getDeviceCsvFilePath()
	deviceMetaFilePath := getDeviceMetaCsvFilePath()
	defaultReturn := DeviceOtaMeta{
		DeviceCsvPath: deviceFilePath,
		DeviceMetaCsvPath: deviceMetaFilePath,
	}

	if _, err := os.Stat(deviceMetaFilePath); os.IsNotExist(err) {
		log.Printf("File %s does not exist", deviceMetaFilePath)
		defaultReturn.Message = "File does not exist"
		return defaultReturn
	}

	file, err := os.Open(deviceMetaFilePath)
	if err != nil {
		log.Printf("Error opening file: %v", err)
		defaultReturn.Message = "error opening file"
		return defaultReturn
	}
	defer file.Close()

	// Create a slice to hold the data
	var meta []*DeviceOtaMeta

	if err := gocsv.UnmarshalFile(file, &meta); err != nil {
		defaultReturn.Message = "unmarshaling error"
		return defaultReturn
	}

	if (len(meta) != 1) {
		defaultReturn.Message = fmt.Sprintf("wrong number of records: %d", len(meta))
		return defaultReturn
	}

	record := meta[0]

	// filup values
	defaultReturn.LastUpdateDate = record.LastUpdateDate
	defaultReturn.NbDevices = record.NbDevices
	defaultReturn.DownloadDuration = record.DownloadDuration

	return defaultReturn
}

func (a *App) UpdateOtaDeviceList(connString string) string {
	deviceFilePath := getDeviceCsvFilePath()
	deviceMetaFilePath := getDeviceMetaCsvFilePath()

	// Create a new table service client
	serviceClient, err := aztables.NewServiceClientFromConnectionString(connString, nil)
	if err != nil {
		log.Print("Failed to create table service client:", err)
		return "ERR: Failed to create table service client"
	}

	go a.retrieveDeviceList(serviceClient, deviceFilePath, deviceMetaFilePath)
	return "started"
}

func (a *App) retrieveDeviceList(serviceClient *aztables.ServiceClient, deviceFilePath string, deviceMetaFilePath string) {
	listOfDevices := make([]DeviceOta, 0, 1000)
	otaDeviceProperties := []string{
		"app_version",
		"azure_device_id",
		"hw_profile",
		"is_employee_device",
		"last_action_sent",
		"note",
	}

	// measure duration
	start := time.Now()

	ensureDir(deviceFilePath)
	ensureDir(deviceMetaFilePath)

	// Get a reference to the table
	tableName := OTA_DEVICE_TABLE
	tableClient := serviceClient.NewClient(tableName)

	// Set the desired page size
	pageSize := int32(1000)

	wruntime.EventsEmit(a.ctx, EVENT_DEVICES_LIST, "started")

	// Create ListEntitiesOptions with the desired page size
	options := &aztables.ListEntitiesOptions{
		Top: &pageSize,
	}

	// Query all entities in the table
	pager := tableClient.NewListEntitiesPager(options)
	numberOfDevices := int32(0)

	// Iterate over the entities
	for pager.More() {
		resp, err := pager.NextPage(context.Background())
		if err != nil {
			log.Println("Failed to get next page:", err)
			wruntime.EventsEmit(a.ctx, EVENT_DEVICES_LIST, "!error 1")
			return
		}

		// prepare to populate device
		currentDevice := DeviceOta{}

		for _, entity := range resp.Entities {
			var myEntity aztables.EDMEntity
			err = json.Unmarshal(entity, &myEntity)
			if err != nil {
				wruntime.EventsEmit(a.ctx, EVENT_DEVICES_LIST, "!error 2")
				continue
			}
			numberOfDevices += 1

			// send events to js app
			if numberOfDevices%1000 == 0 {
				wruntime.EventsEmit(a.ctx, EVENT_DEVICES_LIST, fmt.Sprintf("devices loaded: %d", numberOfDevices))
				fmt.Printf("# devices %d...\n", numberOfDevices)
			}

			for _, propName := range otaDeviceProperties {
				if propValue, ok := myEntity.Properties[propName]; ok {
					switch propName {
					case "app_version":
						currentDevice.AppVersion = getValueAsString(propValue, "")
					case "azure_device_id":
						currentDevice.AzureDeviceId = getValueAsString(propValue, "")
					case "hw_profile":
						currentDevice.HwProfile = getValueAsString(propValue, "")
					case "is_employee_device":
						currentDevice.IsEmployeeDevice = getValueAsBool(propValue, false)
					case "last_action_sent":
						currentDevice.LastActionSent = getValueAsString(propValue, "")
					case "note":
						currentDevice.Note = getValueAsString(propValue, "")
					}
				}
			}
			listOfDevices = append(listOfDevices, currentDevice)
		}
	}

	// write csv files
	// Create the CSV file1
	file1, err := os.Create(deviceFilePath)
	if err != nil {
		fmt.Println("Failed to create file:", deviceFilePath, err)
		return
	}
	defer file1.Close()

	// Write the data to the CSV file
	if err := gocsv.MarshalFile(listOfDevices, file1); err != nil {
		fmt.Println("Failed to write to file:", deviceFilePath, err)
		return
	}

	file2, err := os.Create(deviceMetaFilePath)
	if err != nil {
		fmt.Println("Failed to create file:", deviceMetaFilePath, err)
		return
	}
	defer file2.Close()

	meta := DeviceOtaMeta{}
	meta.NbDevices = numberOfDevices
	meta.LastUpdateDate = getIsoNow()
	meta.DownloadDuration = int32(time.Since(start).Seconds())

	// Write the data to the CSV file
	if err := gocsv.MarshalFile([]DeviceOtaMeta{meta}, file2); err != nil {
		fmt.Println("Failed to write to file:", deviceMetaFilePath, err)
		return
	}

	// notify js that loading is over
	wruntime.EventsEmit(a.ctx, EVENT_DEVICES_LIST, "!ended")
}
