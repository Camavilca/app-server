universityNamesPath <- input[[1]]$universityNamesPath # excel de universidades ruta
stopWordsPath <- input[[1]]$stopWordsPath # excel de stop words ruta
goodWordsPath <- input[[1]]$goodWordsPath # excel de good words ruta
cvPath <- input[[1]]$cvPath # cv pdf ruta


# install.packages("tabulizer")
# install.packages("rJava")
# library(rJava)      # Needed for tabulizer
# library(tabulizer)  # Handy tool for PDF Scraping
needs(tidyverse) 
needs(pdftools)
needs(stringr)
needs(dplyr)

options(stringsAsFactors = FALSE)

ruta = cvPath
files <- pdf_text( ruta )

pdf_list=files %>% strsplit(split = "\n")

if (length(pdf_list[[1]]) == 0){
  stop("+z+Ocurrio un error: Verificar que puedas copiar el texto de tu CV+z+")
}

# length(files)
EXTR_CV <- function(datos){
  
  # CV <- c()
  # for (i in 1:length(datos)) {
       # i=3
       # archivo <- files[i]
    # archivo <- datos[i]
    archivo = datos
    # archivo = files
    # EXTRAYENDO INFORMACION DE CV
    pdf_list=archivo %>% strsplit(split = "\n")    # separando los textos
    
    pdf_list <- unlist(pdf_list)
    pdf_list <- gsub("\r", "", pdf_list)  #quitando los \r como caracteres para limpiar
    
    NOMBRE<- pdf_list[1:8]
    NOMBRE <- chartr('áéíóúÁÉÍÓÚ','aeiouAEIOU',NOMBRE)
    NOMBRE <- str_to_upper(NOMBRE, locale = "es")
    
    CORREO <- unlist(pdf_list[1:25])
    
    TELEFONO <- pdf_list[1:15]
    TELEFONO <- str_to_upper(TELEFONO, locale = "es")
    
    EDUCACION <- pdf_list[1:1000]
    EDUCACION <- chartr('áéíóúÁÉÍÓÚ','aeiouAEIOU',EDUCACION)
    EDUCACION <- str_to_upper(EDUCACION, locale = "es")
    
    CARRERA <- pdf_list[1:1000]
    CARRERA <- chartr('áéíóúÁÉÍÓÚ','aeiouAEIOU',CARRERA)
    CARRERA <- str_to_upper(CARRERA, locale = "es")
    
    UNIVERSIDAD<- pdf_list[1:1000]
    UNIVERSIDAD <- chartr('áéíóúÁÉÍÓÚ','aeiouAEIOU',UNIVERSIDAD)
    UNIVERSIDAD <- str_to_upper(UNIVERSIDAD, locale = "es")
    
    
    needs(rlang)
    # EXTRAYENDO CORREO
    x2 <- CORREO[str_which(CORREO,"@")][1]  # data[ubicacion correo]
    
    if (is.na(x2)|is_empty(x2)|is.na(x2)) {
      
      CORREO <- pdf_list[1:5000]
      CORREO <- str_to_upper(TELEFONO, locale = "es")
      x2 <- CORREO[str_which(CORREO,"@")][1]
      
    } else {x2}
    
    
    x2=ifelse(is.na(x2), "PREGUNTAR O REVISAR" , x2  )
    x2=ifelse(is_empty(x2), "PREGUNTAR O REVISAR" , x2  )
    x2=ifelse(is.na(x2), "PREGUNTAR O REVISAR" , x2  )
    x2=ifelse(is_logical(x2), "PREGUNTAR O REVISAR" , x2  )
    
    # EXTRAYENDO TELEFONO
    
    quita_correo <- str_which(TELEFONO[str_detect(TELEFONO,"\\d")],"@")[1]
    TELEFONO <- TELEFONO[str_detect(TELEFONO,"\\d")][-quita_correo]
    
    tt=unlist(strsplit(TELEFONO,split = " "))
    
    x3 <- tt[str_detect(tt,"\\d")&str_detect(tt,"^9")&(str_count(tt, "\\d")>8)]
    x3=ifelse(is_empty(x3), str_c(tt[str_which(tt,"^9")],tt[str_which(tt,"^9")+1],tt[str_which(tt,"^9")+2]) , x3  )
    # x3=ifelse(is.na(x3),tt[str_which(tt,"MOVISTAR|CLARO|ENTEL|BITEL")],x3)
   
    if (is.na(x3)|is_empty(x3)|is.na(x3)) {
      
      TELEFONO <- pdf_list[1:100]
      TELEFONO <- str_to_upper(TELEFONO, locale = "es")
      tt=unlist(strsplit(TELEFONO,split = " "))
      x3 <- tt[str_detect(tt,"\\d")&str_detect(tt,"^9")&(str_count(tt, "\\d")>8)]
      
    } else {x3}
    
    x3=ifelse(is.na(x3), "PREGUNTAR O REVISAR" , x3  )
    x3=ifelse(is_empty(x3), "PREGUNTAR O REVISAR" , x3  )
    x3=ifelse(is.na(x3), "PREGUNTAR O REVISAR" , x3  )
    x3=ifelse(is_logical(x3), "PREGUNTAR O REVISAR" , x3  )
    
    
    
    # EXTRAYENDO UNIVERSIDAD 
    
    x5 <- UNIVERSIDAD[str_which(UNIVERSIDAD,"UNIVERSIDAD|INSTITUTO")][1]  # data[ ubicacion ]
    x5=ifelse( is.na(x5)|is_empty(x5), "PREGUNTAR O REVISAR"  ,x5  )
    if (x5=="PREGUNTAR O REVISAR") {
      
    needs(readxl)
    nom_univ <- read_excel(universityNamesPath)
    string <- UNIVERSIDAD
    patro <- c()
    for (i in 1:nrow(nom_univ)) {
      pat=nom_univ[i,1]
      patro=c(patro,pat)
    }
    texto=as.character(t(patro))
    texto=str_c(texto, collapse = "|")
    tt=UNIVERSIDAD[str_which(UNIVERSIDAD,texto)]
    x5=tt[str_which(tt,"UNIVER")]
    } else { x5}
    
    x5=ifelse(is.na(x5), "PREGUNTAR O REVISAR" , x5  )
    x5=ifelse(is_empty(x5), "PREGUNTAR O REVISAR" , x5  )
    x5=ifelse(is.na(x5), "PREGUNTAR O REVISAR" , x5  )
    x5=ifelse(is_logical(x5), "PREGUNTAR O REVISAR" , x5  )
    
    # EXTRAYENDO EDUCACION
    
    texto2=as.character(c("DOCTORADO","MAESTRIA","BACHILLER" ,"EGRESADO" ,"LICENCIADO", "ESTUDIANTE","TECNICO", "SECUNDARIA COMPLETA"))
    texto2=str_c(texto2, collapse = "|")
    
    x4 <- EDUCACION[str_which(EDUCACION,texto2)] [1]
   
    x4=ifelse(is.na(x4), "PREGUNTAR O REVISAR" , x4  )
    x4=ifelse(is_empty(x4), "PREGUNTAR O REVISAR" , x4  )
    x4=ifelse(is.na(x4), "PREGUNTAR O REVISAR" , x4  )
    x4=ifelse(is_logical(x4), "PREGUNTAR O REVISAR" , x4  )
   
     # EXTRAYENDO NOMBRE
    x1 <- as.character(NOMBRE[1])
    
    # ADJUNTANDO PALABRAS
    
    needs(tm)
    needs(dplyr)
    needs(tidytext)
    needs(pdftools)
    needs(readr)
    
    #convertir pdf en texto
    text = archivo %>% read_lines()

    #convertir texto en tibble
    text_df <- tibble(line = 1:length(text), text = text)

    # obtienes los tokens
    text_df=text_df %>%          
      unnest_tokens(word, text)

    # elimina los stopwords
    palabras <-get_stopwords("spanish")[,1]
    text_df<- text_df[,2] %>%
      setdiff(palabras)
    
    # elimina los stopwords ADICIONALES
    palabras2 <-readxl::read_excel(stopWordsPath)[,1]
    text_df<- text_df %>%
      setdiff(palabras2 ) 
    
    #  cambiando de columna tabla a lista
    text_df <- text_df$word  
    text_df <- unique(text_df)
    text_df <-  c(text_df)
    
    # quitar n?meros
    number <- str_which(text_df,"\\d")
    if(is_empty(number)){
      text_df <- text_df
    } else { text_df <- text_df[-number]}
    
    # quitar paginas o correos
    # direcciones_correos_web <- str_which(text_df,".com")
    direcciones_correos_web <- str_which(text_df,".com")

    if (is_empty(direcciones_correos_web)) {
      text_df<- text_df
    } else {text_df<- text_df[-direcciones_correos_web]}
    
    # quitar puntaciones
    text_df <-  chartr('áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙ','aeiouAEIOUaeiouAEIOU',text_df)
    text_df <- str_to_lower(text_df, locale = "es")

    # palabras bien escritas en español
    N_text <- length(text_df)
    palabras_buenas <- readxl::read_excel(goodWordsPath)
    palabras_buenas <-palabras_buenas[,1]
    A <- as_tibble(text_df)
    C <- as_tibble(palabras_buenas)
    names(C) <- c("value")
    mues_text_b <- intersect(A,C)
    mues_text1_b <- nrow(mues_text_b)
    prop2 <- as.numeric(round(mues_text1_b/N_text,5)*100)
    
    needs(stringr)
    # UNIR LISTA EN UNO
    text_df <- unlist(text_df)
    x6 <- str_c(text_df,sep = " ", collapse = ",")

    x6=ifelse(is.na(x6), "CV ERRONEO REVISAR" , x6  )
    x6=ifelse(is_empty(x6), "CV ERRONEO REVISAR" , x6  )
    x6=ifelse(is.na(x6), "CV ERRONEO REVISAR" , x6  )
    x6=ifelse(is_logical(x6), "CV ERRONEO REVISAR" , x6  )
    
    x6=ifelse(is.na(x6), "CV ERRONEO REVISAR" , x6  )
    x6=ifelse(is_empty(x6), "CV ERRONEO REVISAR" , x6  )
    x6=ifelse(is.na(x6), "CV ERRONEO REVISAR" , x6  )
    x6=ifelse(is_logical(x6), "CV ERRONEO REVISAR" , x6  )
    
    
    # UNIENDO 
    ID=as.character(Sys.time())
    cvprima <- cbind(ID,x1,x2,x3,x4,x5,prop2,x6)
    CV <- rbind(cvprima)
    
  # }
  CV <- data.frame(CV)  
  names(CV) <- c("id","nombre","correo","telefono","grado" ,"universidad","% palabras buenas","words")
  return(CV) 
}   # CAMBIO EN LINEA 177 , RUTA DE ARCHIVO

cvfinal=EXTR_CV(files)

#  LIMPIEZA FINAL

cvfinal$nombre <- gsub("     ","", cvfinal$nombre)
cvfinal$correo <- gsub("Correo personal: ","", cvfinal$correo)
cvfinal$correo <- gsub("E-mail: ","", cvfinal$correo)
cvfinal$universidad <- gsub("PERU.","PERU", cvfinal$universidad)
cvfinal$universidad <- chartr('"',' ', cvfinal$universidad)
cvfinal$grado <- chartr('*',' ',cvfinal$grado)
cvfinal$grado <- chartr('.',' ',cvfinal$grado)

borra_espacios <- function(datos){
   # datos=cvfinal$Universidad
N <- length(datos)
  for (j in 1:N) {
    datos[j] <- trimws(x = (datos[j]),which = "left")
  }
return(datos)  
}

cvfinal$universidad <- borra_espacios(cvfinal$universidad)
cvfinal$grado <- borra_espacios(cvfinal$grado)
cvfinal$correo <- borra_espacios(cvfinal$correo)
cvfinal$nombre <- borra_espacios(cvfinal$nombre)


# LIMPIO <- str_which(cvfinal$universidad, "UNIVERSIDAD")

# data_limpio <- cvfinal[-LIMPIO,]    # data_limpio$universidad
# data_sucio <- cvfinal[LIMPIO,]   # data_sucio$universidad

# comienza <-str_which(data_sucio$universidad,"^U")

# data_sucio_si <- data_sucio[-comienza,]    # data_sucio_si$universidad
# data_sucio_no <- data_sucio[comienza,]    # data_sucio_no$universidad

# if (nrow(data_sucio_si)!=0 | nrow(data_sucio_no)!=0) {

# # RENOMBRANDO EL NOMBRE DE LA UNIVERSIDAD
# extrayendo_nom_univer <- function(datos){
  
#   st <- matrix(0,length(datos),1)
#   for (i in 1:length(datos)) {
#      datos <- data_sucio$universidad
#     sl= str_split_fixed(  strsplit(as.character(datos), split="UNIV")[[i]] , "  ", n=10)
#     st[i,1]=str_c("UNIV",sl[2,1],collapse ="" )
#   }
#   return(st)
# }

# data_sucio_si$universidad=extrayendo_nom_univer(data_sucio_si$universidad)
# cvfinal <- rbind(data_limpio,data_sucio_no,data_sucio_si)

# }



cvfinal <- cvfinal[order(cvfinal$id),]



names(cvfinal) <- c("id","nombre","correo","telefono","grado" ,"universidad","palabras_buenas","words")

# rm(data_limpio);rm(data_sucio);rm(data_sucio_no);rm(data_sucio_si)

cvfinal$id <- as.character(cvfinal$id)
cvfinal$telefono <- as.character(cvfinal$telefono)

cvfinal$palabras_buenas <- as.double(cvfinal$palabras_buenas)




# validando cv bien estructurados o escritos

CV <- c()

for (i in 1:nrow(cvfinal)) {
  CV[i] = ifelse(cvfinal[i,7]>= 10,1,0)
}

if (mean(CV)!=1) {
  cvfinal <- data.frame(cvfinal,CV)
  cvfinal <- subset(cvfinal,cvfinal$CV==1)
  cv_erroneo = subset(cvfinal,cvfinal$CV==0)
  cvfinal <- cvfinal[,-9]
} 

cvfinal




# ARCHIVOS LIMPIOS DE CV....SI HAY ERROR VERIFICAR LOS PORCENTAJES

########################################################################################################################
########################################################################################################################
########################################################################################################################





##########################
##########################   FIN LIMPIEZA
##########################





