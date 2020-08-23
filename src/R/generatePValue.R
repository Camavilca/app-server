needs(readxl)
needs(tidyr)
needs(dplyr)


planillaPath <- input[[1]]$planillaPath # planilla
ponderacionPath <- input[[1]]$ponderacionPath # ponderacion/puntaje x puesto
factoresPath <- input[[1]]$factoresPath # factore

datos11 <- read_excel(planillaPath)  # info de trabajadores
datos22 <- read_excel(ponderacionPath) # puntajes por puesto
valores <- read_excel(factoresPath)   # tabla de factores

datos11 <- datos11[,c(1,3,4,7,9,17)]

if (ncol(datos22)>13){
  datos22 <- datos22[,c(1:13)]
}


data <- merge(datos11,datos22,by.x = "Puesto", by.y = "Puestos")
data <- data[order(data$`Sueldo Bruto`), ]
data <- data.frame(data[,c(2,3,4,1,5,6,7:dim(data)[2])])

nom_facto <- names(datos22[,-1])
names(data) <- c ("Codigo de Trabajador","DNI/CE","Genero","Cargo","Nivel","Sueldo Bruto",nom_facto)

data$`Sueldo Bruto`=as.double(data$`Sueldo Bruto`)

creator <- function(datos1,datos2){
  
  nombre <- t(datos2)[1,]
  
  n <- as.numeric(t(datos2)[2,])
  pe <- t(datos2)[3,]
  m <- dim(datos2)[1]
  nn <- seq(1,m,1)
  
  Nty <- dim(datos1)[1]
  N1 <- dim(datos1)[2]
  
  Grados <- c()
  Puntaje_Tabulado <- c()
  Valor_Ponderado <- c()
  Factor <- c()
  
  # creacion puntajes
  
  for (i in 1:m){
    tr <- seq(1,n[i],1)
    r1 <- as.double(round(seq(1,10,9/(n[i]-1)),2))
    p1 <- as.double(rep(pe[i],n[i]))
    p2 <- rep(nn[i],n[i])
    
    Grados <- c(Grados,tr)
    Puntaje_Tabulado <- c(Puntaje_Tabulado,r1)
    Valor_Ponderado <- c(Valor_Ponderado,p1)
    Factor <- c(Factor,p2)
  }
  Puntaje_Final=Valor_Ponderado*Puntaje_Tabulado
  dat <- cbind(Factor,Grados,Puntaje_Tabulado,Valor_Ponderado,Puntaje_Final)
  
  names(datos1) <- c("Codigo de Trabajador","DNI","Genero","Cargo","Sede","Sueldo Bruto",nn)   # si cambia la dimension de data1 cambiar aqui
  
  needs(tidyr)
  needs(dplyr)
  
  # creacion matriz de datos
  
  dat <- data.frame(dat)
  desligue1 <- as.vector(as.matrix(datos1[,7:N1]))             # si cambia la dimension de data1 cambiar aqui
  cant_por_col <- as.numeric(apply(datos1[,7:N1], 2, length))  # si cambia la dimension de data1 cambiar aqui
  base1 <- rep(seq(1,m,1),cant_por_col)
  base2 <- data.frame(base1, desligue1)
  u1=unite(dat,id,c(Factor,Grados),sep = "_")
  u2=unite(base2,id,c(base1, desligue1),sep = "_")
  u2 <- mutate(u2,Nll=seq(1,dim(u2)[1],1))
  u3 <- merge(u2,u1,sort = F)
  DatosTesNr1 = u3[order(u3$Nll), ]
  NN1=N1-6                                                     # si cambia la dimension de data1 cambiar aqui
  datos3=matrix(DatosTesNr1$Puntaje_Final,Nty,NN1)
  SUM <- round(apply(datos3, 1, sum),0)
  
  demo_1 <- data.frame(datos1[,c(1:6)],datos3,SUM)
  return(demo_1)}
demo=creator(data,valores)


needs(dplyr)

datos = demo %>% select(Genero,Cargo,SUM,Sueldo.Bruto)
# datos <- read_excel("C:/AVANCE HCP/CREACION DASHBOARD/datos.xlsx")

rm(demo);rm(datos11);rm(datos22);rm(data);rm(valores);rm(nom_facto)


needs(ggplot2)

# datos <- read.delim("clipboard")
library(dplyr)

names(datos) <-c( "GENERO" , "Puesto" , "Puntaje", "Sueldo" )
# names(datos) <-c(   "Puesto" ,  "Puntaje" , "Sueldo"  ,   "GENERO" , "CODIGO")
#######################
####     MEDIANAS POR GENERO Y CAJA
#######################

library(stringr)

datos$GENERO <- chartr('·ÈÌÛ˙¡…Õ”⁄','aeiouAEIOU',datos$GENERO)
datos$GENERO <- str_to_upper(datos$GENERO, locale = "es")

for (gen in 1:nrow(datos)) {
  datos[gen,1] <- ifelse(datos[gen,1]=="HOMBRE","MASCULINO",datos[gen,1])
  datos[gen,1] <- ifelse(datos[gen,1]=="MUJER","FEMENINO",datos[gen,1])
  datos[gen,1] <- ifelse(datos[gen,1]=="F","FEMENINO",datos[gen,1])
  datos[gen,1] <- ifelse(datos[gen,1]=="M","MASCULINO",datos[gen,1])
}


# REVISAR QUE LOS SUELDOS ESTEN EN   INT
# REVISAR QUE EL GENERO SEA "MASCULINO" y "FEMENINO"

SUM <- datos$Puntaje
 
# CREANDO LAS CAJAS

Caja <- c()
if (min(SUM)<300){
  for (i in 1:length(SUM)) {
    Caja[i]=ifelse(SUM[i]>200 && SUM[i]<300,1,
                   ifelse(SUM[i]>=300 && SUM[i]<400,2,
                          ifelse(SUM[i]>=400 && SUM[i]<550,3,
                                 ifelse(SUM[i]>=550 && SUM[i]<700,4,
                                        ifelse(SUM[i]>=700 && SUM[i]<850,5,6))))) } 
} else {
  for (i in 1:length(SUM)) {
    Caja[i]=ifelse(SUM[i]>=300 && SUM[i]<400,1,
                   ifelse(SUM[i]>=400 && SUM[i]<550,2,
                          ifelse(SUM[i]>=550 && SUM[i]<700,3,
                                 ifelse(SUM[i]>=700 && SUM[i]<850,4,5)))) } }
bas_1 <- data.frame(datos,Caja)
bas_1 <- bas_1[order(bas_1$Caja),]
bas_1$GENERO <- as.factor(bas_1$GENERO)
# CREANDO MEDIANAS POR GENERO

med_gen<- c()  
pvalor <- c()  
for (iii in 1:max(bas_1$Caja)) {
 # iii=1
bh_1 <- subset(bas_1,bas_1$Caja==iii)
bh1_H <- subset(bh_1,bh_1$GENERO=="MASCULINO") ; bh1_M <- subset(bh_1,bh_1$GENERO=="FEMENINO")
N_H <- nrow(bh1_H) ; N_M <- nrow(bh1_M)   
med <- as.numeric(tapply(bh_1$Sueldo,as.factor(bh_1$GENERO),median))

if ((N_H==0|N_M==0)) { wil_1 = -1}
  else {wil_1 <- round(wilcox.test(bh1_H$Sueldo,bh1_M$Sueldo,paired = FALSE)$p.value,4)}

med_gen <- rbind(med_gen,med)
pvalor <- rbind(pvalor,wil_1)
}
resultado <- data.frame(med_gen,pvalor)
names(resultado) <- c("Mediana mujeres","Mediana hombres","pvalor")
row.names(resultado ) <- seq(1,max(bas_1$Caja))

resultado <- resultado[,c(2,1,3)]

resultado$pvalor   
# es normal que la prueba salga asi
#          cannot compute exact p-value with ties






