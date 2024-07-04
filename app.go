package main

import (
	"context"
	"runtime"
	"strconv"

	"path/filepath"

	"github.com/adrg/xdg"
)

const AppPrefix = "gardyn_fleet_app"

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
func (a *App) AzureGetOtaDevices(connStr string, filter OtaDevicesFilter) []map[string]string {
	var sliceOfMaps []map[string]string

	// serviceClient, err := aztables.NewServiceClientFromConnectionString(connStr, nil)
	// if err != nil {
	// 	return sliceOfMaps
	// }

	// Initialize and append maps to the slice
	sliceOfMaps = append(sliceOfMaps, map[string]string{"AppVersion": filter.AppVersion})
	sliceOfMaps = append(sliceOfMaps, map[string]string{"HwProfile": filter.HwProfile})
	sliceOfMaps = append(sliceOfMaps, map[string]string{"LastOtaAction": filter.LastOtaAction})
	sliceOfMaps = append(sliceOfMaps, map[string]string{"OnlyEmployeeDevices": strconv.FormatBool(filter.OnlyEmployeeDevices)})

	return sliceOfMaps
}
