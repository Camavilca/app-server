# .libPaths( c( .libPaths(), "C:/Users/Jose Veliz/Documents/R/win-library/3.6") )
needs(rmarkdown)
needs(knitr)
needs(dplyr)


trabajadoresPath <- input[[1]]$trabajadoresPath # trabajadores
ponderacionesPath <- input[[1]]$ponderacionesPath # puestos
factoresPath <- input[[1]]$factoresPath # factores
logoPath <- input[[1]]$logoPath # logo path
outputHTML <- input[[1]]$htmlOutputPath # output html
dirname <- input[[1]]$dirname # dirname to file

needs(readxl)

datos11 <- read_excel(trabajadoresPath)  # info de trabajadores
datos22 <- read_excel(ponderacionesPath) # puntajes por puesto
valores <- read_excel(factoresPath)   # tabla de factores

datos11 <- datos11[,c(1,3,4,7,9,17)]

if(ncol(datos22) > 13){
  datos22 <- datos22[,c(1:13)]
}

#|| !is.integer(datos11$sueldo)

# is.numeric(datos11$`Sueldo Bruto`)

if (!is.numeric(datos11$`Sueldo Bruto`) || !is.double(datos11$`Sueldo Bruto`)) {
  stop('+z+Verificar que el campo \"Sueldo\" tenga el formato correcto+z+')
}

rmarkdown::render(stringr::str_interp("${dirname}/createDashboardHtml.Rmd"), output_file = outputHTML)