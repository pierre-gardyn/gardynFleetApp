package main

import (
	"context"
	"runtime"

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
