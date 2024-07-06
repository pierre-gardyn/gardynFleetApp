package main

import (
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strconv"
	"time"

	"github.com/adrg/xdg"
)

func getDeviceCsvFilePath() string {
	return filepath.Join(xdg.UserDirs.Documents, AppPrefix, "ota_devices.csv")
}

func getDeviceMetaCsvFilePath() string {
	return filepath.Join(xdg.UserDirs.Documents, AppPrefix, "ota_devices_meta.csv")
}

func getValueAsString(value any, defaultValue string) string {
	// Type assertion with switch
	switch v := value.(type) {
	case string:
		return v
	default:
		typ := reflect.TypeOf(value)
		fmt.Printf("Unknown type: %v -type: %v\n", value, typ)
		return defaultValue
	}
}

func getValueAsInt(value any, defaultValue int) int {
	// Type assertion with switch
	switch v := value.(type) {
	case int:
		return v
	case int16:
		return int(v)
	case int32:
		return int(v)
	case int64:
		return int(v)
	default:
		typ := reflect.TypeOf(value)
		fmt.Printf("Unknown type: %v -type: %v\n", value, typ)
		return defaultValue
	}
}

func getValueAsBool(value any, defaultValue bool) bool {
	// Type assertion with switch
	switch v := value.(type) {
	case bool:
		return v
	default:
		typ := reflect.TypeOf(value)
		fmt.Printf("Unknown type: %v -type: %v\n", value, typ)
		return defaultValue
	}
}

func getStringValue(value any) string {
	strValue := ""
	// Type assertion with switch
	switch v := value.(type) {
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
		typ := reflect.TypeOf(value)
		fmt.Printf("Unknown type: %v -type: %v\n", value, typ)
	}
	return strValue
}

func getIsoNow() string {
	// Get the current time in UTC
	currentTimeUTC := time.Now().UTC()

	// Format the time as ISO 8601
	iso8601 := currentTimeUTC.Format(time.RFC3339)

	return iso8601

}

func toIso(currentTimeUTC time.Time) string {
	// Format the time as ISO 8601
	iso8601 := currentTimeUTC.Format(time.RFC3339)

	return iso8601

}

func ensureDir(path string) error {
	// Get the directory part of the path
	dir := filepath.Dir(path)

	// Ensure the directory exists
	return os.MkdirAll(dir, os.ModePerm)
}
