package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"
	"reflect"
	"runtime"
	"strconv"

	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
	"github.com/adrg/xdg"
)

const AppPrefix = "gardyn_fleet_app"

const OTA_DEVICE_TABLE = "gOtaDevices"

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

// appVersion string, hwProfile string, lastOtaAction string, onlyEmployeeDevices bool
func (a *App) AzureGetOtaDevices(connString string, filter OtaDevicesFilter) []map[string]string {
	var sliceOfMaps []map[string]string
	otaDeviceProperties := []string{
		"Timestamp",
		"action_to_run",
		"app_version",
		"azure_device_id",
		"call_count",
		"hw_profile",
		"is_employee_device",
		"last_action_sent",
		"ota_agent_version",
		"timestamp_device_created",
		"timestamp_last_action_sent",
		"timestamp_last_ping",
		"timestamp_response_received",
		"note",
	}

	// Create a new table service client
	serviceClient, err := aztables.NewServiceClientFromConnectionString(connString, nil)
	if err != nil {
		log.Fatal("Failed to create table service client:", err)
	}

	// Get a reference to the table
	tableName := OTA_DEVICE_TABLE
	tableClient := serviceClient.NewClient(tableName)

	// Set the desired page size
	pageSize := int32(1000)

	// Create ListEntitiesOptions with the desired page size
	options := &aztables.ListEntitiesOptions{
		Top: &pageSize,
	}

	// Query all entities in the table
	pager := tableClient.NewListEntitiesPager(options)
	counter := 1
	nbRecords := 0

	// Iterate over the entities
	for pager.More() {
		resp, err := pager.NextPage(context.Background())
		if err != nil {
			log.Fatal("Failed to get next page:", err)
		}
		fmt.Printf("# page %d (%d) %d...\n", counter, len(resp.Entities), nbRecords)
		nbRecords += len(resp.Entities)
		counter += 1

		for _, entity := range resp.Entities {
			props := make(map[string]string)

			var myEntity aztables.EDMEntity
			err = json.Unmarshal(entity, &myEntity)
			if err != nil {
				panic(err)
			}
			for _, propName := range otaDeviceProperties {
				if propValue, ok := myEntity.Properties[propName]; ok {
					strValue := ""
					// Type assertion with switch
					switch v := propValue.(type) {
					case string:
						strValue = v
					case int:
						strValue = strconv.Itoa(v)
					case int16:
						strValue = strconv.FormatInt(int64(v), 10)
					case int32:
						strValue = strconv.FormatInt(int64(v), 10)
					case int64:
						strValue = strconv.FormatInt(v, 10)
					case bool:
						strValue = strconv.FormatBool(v)
					default:
						typ := reflect.TypeOf(propValue)
						fmt.Printf("Unknown type: %v -type: %v\n", propValue, typ)
					}
					props[propName] = strValue
				}
			}
			sliceOfMaps = append(sliceOfMaps, props)
		}
	}

	// sliceOfMaps = append(sliceOfMaps, map[string]string{"AppVersion": filter.AppVersion})
	// sliceOfMaps = append(sliceOfMaps, map[string]string{"HwProfile": filter.HwProfile})
	// sliceOfMaps = append(sliceOfMaps, map[string]string{"LastOtaAction": filter.LastOtaAction})
	// sliceOfMaps = append(sliceOfMaps, map[string]string{"OnlyEmployeeDevices": strconv.FormatBool(filter.OnlyEmployeeDevices)})

	fmt.Printf("# Done nbRecords=%d\n", nbRecords)

	return sliceOfMaps
}
