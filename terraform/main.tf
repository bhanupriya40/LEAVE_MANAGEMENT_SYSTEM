provider "azurerm" {
  features {}

  client_id       = var.client_id
  client_secret   = var.client_secret
  tenant_id       = var.tenant_id
  subscription_id = var.subscription_id
}

# Resource Group
resource "azurerm_resource_group" "lms" {
  name     = "rg-lms-central-india"
  location = var.location
}

# App Service Plan (Premium v2)
resource "azurerm_app_service_plan" "lms_plan" {
  name                = "asp-lms-premiumv2"
  location            = azurerm_resource_group.lms.location
  resource_group_name = azurerm_resource_group.lms.name
  sku {
    tier = "Standard"
    size = "S1"
  }
  maximum_elastic_worker_count = 3
}

# Web App for Frontend + API
resource "azurerm_app_service" "lms_web" {
  name                = "webapp-lms"
  location            = azurerm_resource_group.lms.location
  resource_group_name = azurerm_resource_group.lms.name
  app_service_plan_id = azurerm_app_service_plan.lms_plan.id

  site_config {
    always_on = true
    ftps_state = "Disabled"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    environment = "dev"
    project     = "lms"
  }
}


# Blob Storage (GRS)
resource "azurerm_storage_account" "lms_storage" {
  name                     = "lmsstoragedev001"
  resource_group_name      = azurerm_resource_group.lms.name
  location                 = azurerm_resource_group.lms.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  access_tier              = "Hot"

  blob_properties {
    delete_retention_policy {
      days = 7
    }
  }

  tags = {
    environment = "dev"
    project     = "lms"
  }
}

# Blob Container for media
resource "azurerm_storage_container" "media" {
  name                  = "eventmedia"
  storage_account_name  = azurerm_storage_account.lms_storage.name
  container_access_type = "private"
}
