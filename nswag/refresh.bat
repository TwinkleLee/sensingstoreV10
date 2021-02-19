if "%2"=="" (
  ren service.config.nswag-%1% service.config.nswag
  "..\node_modules\.bin\nswag" run
) else (
  ren service.config.nswag service.config.nswag-%1%
)