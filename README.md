# Magento CLI for VSCode

That extension helps you to run all commands from Magento CLI tool in your VSCode environment.

## Features
- Run all commands
- Docker support
- Add custom commands [To Do]

## Settings

The config below is necessary to run the commands:

- Localhost
```json
{
    "magentoCommand.php.executablePath": "/your/php/root",
    "magentoCommand.magento.root": "/your/magento/root"
}
```

- Docker Container

```json
{
    "magentoCommand.php.executablePath": "docker exec your_container_name",
    "magentoCommand.magento.root": "/your/magento/root"
}
```