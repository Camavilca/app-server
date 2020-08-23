needs(flexdashboard)
needs(splines)
needs(Ckmeans.1d.dp)
needs(ggplot2)
needs(readxl)
needs(tibble)
needs(dplyr)
needs(knitr)

planillaPath <- input[[1]]$planillaPath # planilla
ponderacionPath <- input[[1]]$ponderacionPath # ponderacion/puntaje x puesto
factoresPath <- input[[1]]$factoresPath # factore
bandasPath <- input[[1]]$bandasPath # factore
modeloPath <- input[[1]]$modeloPath # factore
equidadPath <- input[[1]]$equidadPath # factore

needs(readxl)
datos11 <- read_excel(planillaPath)  # info de trabajadores
datos22 <- read_excel(ponderacionPath) # puntajes por puesto
valores <- read_excel(factoresPath)   # tabla de factores

datos11 <- datos11[,c(1,3,4,7,9,17)]


if (ncol(datos22)>13){
  datos22 <- datos22[,c(1:13)]
}


data <- merge(datos11,datos22,by.x = "Puesto", by.y = "Puestos")
data <- data %>% arrange(data[,6])
data <- data.frame(data[,c(2,3,4,1,5,6,7:dim(data)[2])])

nom_facto <- names(datos22[,-1])
names(data) <- c ("Codigo de Trabajador","DNI/CE","Genero","Cargo","Nivel","Sueldo Bruto",nom_facto)

data[,6]=as.double(data[,6])
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
datos = demo[,c(1,3,4,19,6)]
# datos <- read_excel("C:/AVANCE HCP/CREACION DASHBOARD/datos.xlsx")
names(datos) <- c("CODIGO","GENERO","CARGO","Puntos","Ingreso")

rm(demo);rm(datos11);rm(datos22);rm(data);rm(valores);rm(nom_facto)

##########################################################################################
##########################################################################################
# GRAFICA DE BANDAS

needs(dplyr)
datB <- datos %>% select(GENERO,CARGO,Puntos,Ingreso)
names(datB) <-c( "GENERO" , "Puesto" , "PUNTOS", "SUELDO" )


## GRAFICA DE CAJAS


SUM <- datB$PUNTOS
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
bas_1 <- data.frame(datB,Caja)
datB <- bas_1[order(bas_1$Caja),]
ff <- as.numeric(tapply(datB$SUELDO,datB$Caja,median))

f_lim <- NULL
if (min(datB$PUNTOS)<300){
  f_lim<- c(200,300,400,550,700,850,1000)
} else {
  f_lim<- c(300,400,550,700,850,1000)
}
f_lim <- as.numeric(f_lim)

LIM_y <-ifelse(max(datB$SUELDO)>max(ff)*1.35,max(datB$SUELDO)+2000,max(ff)*1.35+2000)

needs(ggplot2);needs(readxl);needs(tibble);needs(dplyr)
p = ggplot(datB,aes(x = as.numeric(PUNTOS),y = as.numeric(unlist(SUELDO)),color= GENERO)) + geom_point(size=1.5) +  theme_bw() + theme(legend.justification=c(0,1), legend.position=c(0.02,0.965),legend.title=element_blank())+ scale_color_manual("Change", values = c("#FFAF33" , "#58A1DA"), labels = c("Mujeres", "Hombres"))
p= p+ggtitle("Distribución de puestos y sueldos con bandas salariales")+theme(axis.text.x=element_blank(),axis.ticks.x=element_blank())+ylab("Remuneración")+xlab('Valoración de puestos')+ scale_y_continuous(limits = c(0, LIM_y))
#c("#FF4000","#013ADF")
if(max(datB$Caja)==3){
  p = p + geom_rect(aes(xmin = f_lim[1],xmax = f_lim[2],ymin=ff[1]*0.65,ymax=ff[1]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[2],xmax = f_lim[3],ymin=ff[2]*0.65,ymax=ff[2]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[3],xmax = f_lim[4],ymin=ff[3]*0.65,ymax=ff[3]*1.35),colour="black", alpha = 0,linetype=2)
}

if(max(datB$Caja)==4){
  p = p + geom_rect(aes(xmin = f_lim[1],xmax = f_lim[2],ymin=ff[1]*0.65,ymax=ff[1]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[2],xmax = f_lim[3],ymin=ff[2]*0.65,ymax=ff[2]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[3],xmax = f_lim[4],ymin=ff[3]*0.65,ymax=ff[3]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[4],xmax = f_lim[5],ymin=ff[4]*0.65,ymax=ff[4]*1.35),colour="black", alpha = 0,linetype=2)
}

if(max(datB$Caja)==5){
  p = p + geom_rect(aes(xmin = f_lim[1],xmax = f_lim[2],ymin=ff[1]*0.65,ymax=ff[1]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[2],xmax = f_lim[3],ymin=ff[2]*0.65,ymax=ff[2]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[3],xmax = f_lim[4],ymin=ff[3]*0.65,ymax=ff[3]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[4],xmax = f_lim[5],ymin=ff[4]*0.65,ymax=ff[4]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[5],xmax = f_lim[6],ymin=ff[5]*0.65,ymax=ff[5]*1.35),colour="black", alpha = 0,linetype=2)
}

if(max(datB$Caja)==6){
  p = p + geom_rect(aes(xmin = f_lim[1],xmax = f_lim[2],ymin=ff[1]*0.65,ymax=ff[1]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[2],xmax = f_lim[3],ymin=ff[2]*0.65,ymax=ff[2]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[3],xmax = f_lim[4],ymin=ff[3]*0.65,ymax=ff[3]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[4],xmax = f_lim[5],ymin=ff[4]*0.65,ymax=ff[4]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[5],xmax = f_lim[6],ymin=ff[5]*0.65,ymax=ff[5]*1.35),colour="black", alpha = 0,linetype=2)
  p = p + geom_rect(aes(xmin = f_lim[6],xmax = f_lim[7],ymin=ff[6]*0.65,ymax=ff[6]*1.35),colour="black", alpha = 0,linetype=2)
}

# Distribución de puestos y sueldos de la empresa 
ggsave(p, filename = modeloPath, width = 16.93, height = 12.7, units = "cm", dpi = 96)

##########################################################################################
##########################################################################################
# GRAFICA DE COMPORTAMIENTO

datos_mod <-  datB 

needs(stringr)

datos_mod$GENERO <- chartr('·ÈÌÛ˙¡…Õ”⁄','aeiouAEIOU',datos_mod$GENERO)
datos_mod$GENERO <- str_to_upper(datos_mod$GENERO, locale = "es")

for (gen in 1:nrow(datos_mod)) {
  datos_mod[gen,1] <- ifelse(datos_mod[gen,1]=="HOMBRE","MASCULINO",datos_mod[gen,1])
  datos_mod[gen,1] <- ifelse(datos_mod[gen,1]=="MUJER","FEMENINO",datos_mod[gen,1])
  datos_mod[gen,1] <- ifelse(datos_mod[gen,1]=="F","FEMENINO",datos_mod[gen,1])
  datos_mod[gen,1] <- ifelse(datos_mod[gen,1]=="M","MASCULINO",datos_mod[gen,1])
}
datos_mod$GENERO <- as.factor(datos_mod$GENERO)

mod_exponencial <- lm(log(SUELDO)~PUNTOS,data=datos_mod)
mod_polinomial_2 <- lm(SUELDO~PUNTOS+I(PUNTOS^2),data=datos_mod)

tabla_resumen <- matrix(0,2,10)
tabla_resumen <- as.data.frame(tabla_resumen)
names(tabla_resumen) <- c("MODELO","COEF_SIG","MOD_SIG","R2","COEF_1","COEF_2","COEF_3","","","VALIDEZ")

# nombre de modelo
tabla_resumen[,1] <- c("Mod.exponencial","Mod.polinomial")

# significancia de coeficiente
tabla_resumen[,2] <- c((summary(mod_exponencial)$coefficients[1,4] < 0.05 & summary(mod_exponencial)$coefficients[2,4] < 0.05),
                       ((summary(mod_polinomial_2)$coefficients[1,4] < 0.05) & (summary(mod_polinomial_2)$coefficients[2,4] < 0.05) & (summary(mod_polinomial_2)$coefficients[3,4] < 0.05)))

# significancia del modelo
tabla_resumen[,3] <- c((1-pf(summary(mod_exponencial)$fstatistic[1],summary(mod_exponencial)$fstatistic[2],summary(mod_exponencial)$fstatistic[3])) < 0.05,
                       (1-pf(summary(mod_polinomial_2)$fstatistic[1],summary(mod_polinomial_2)$fstatistic[2],summary(mod_polinomial_2)$fstatistic[3])) < 0.05)

# valor de r2
tabla_resumen[,4] <- c(round(summary(mod_exponencial)$r.squared,2),round(summary(mod_polinomial_2)$r.squared,2))


# coeficientes del modelo para la ecuacion
tabla_resumen[,5] <- c(round(summary(mod_exponencial)$coefficients[2,1],3), round(summary(mod_polinomial_2)$coefficients[2,1],3))
tabla_resumen[,6] <- c(round(summary(mod_exponencial)$coefficients[1,1],3), round(summary(mod_polinomial_2)$coefficients[3,1],3))
tabla_resumen[,7] <- c( 0,  round(summary(mod_polinomial_2)$coefficients[1,1],3))

# validez del modelo
tabla_resumen[,8] <- c(ifelse( tabla_resumen[1,2] == TRUE , 1, 0), ifelse(  tabla_resumen[2,2]  == TRUE , 1, 0) )
tabla_resumen[,9] <- c(ifelse( tabla_resumen[1,3] == TRUE , 1, 0), ifelse(  tabla_resumen[2,3]  == TRUE , 1, 0) )

tabla_resumen[,10] <- c(  tabla_resumen[1,8]+tabla_resumen[1,9] , tabla_resumen[2,8]+tabla_resumen[2,9]  )

tabla_resumen <- tabla_resumen[,-c(8,9)]


# Grafica del mejor modelo


x2 <- seq(200,1000,2.5)
y1 <- as.numeric(coefficients(mod_polinomial_2))  # revisar esta ecuacion con cuidado
y2 <-  y1[1] + y1[2]*x2 + y1[3]*(x2^2)     # revisar esta ecuacion con cuidado

if (y2[1]==min(y2)) { 
  tabla_resumen = tabla_resumen
} else {tabla_resumen = tabla_resumen[-2,] }

tabla_resumen_op <- subset(tabla_resumen,tabla_resumen$VALIDEZ==2)

if (nrow(tabla_resumen_op)==2) {
  if (tabla_resumen_op$R2[1]>tabla_resumen_op$R2[2]) {
    tabla_resumen_op <- tabla_resumen_op[1,]  
  } else { tabla_resumen_op <- tabla_resumen_op[2,] }
}


if(tabla_resumen_op$MODELO=="Mod.exponencial"){
  y1 <- as.numeric(coefficients(mod_exponencial))  # revisar esta ecuacion con cuidado
  y2 <-  exp(y1[1]) * exp(y1[2]*x2) 
  Ecuacion = c("un modelo exponencial")
  R22 = tabla_resumen_op$R2      
}

if(tabla_resumen_op$MODELO=="Mod.polinomial"){
  y1 <- as.numeric(coefficients(mod_polinomial_2))  # revisar esta ecuacion con cuidado
  y2 <-  y1[1] + y1[2]*x2 + y1[3]*(x2^2) 
  Ecuacion = c("un modelo polinomial ")
  R22 = tabla_resumen_op$R2 
}


#  GRAFICA ESTIMADA
  
SUM <- datos_mod$PUNTOS
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
bas_1 <- data.frame(datos_mod,Caja)
datos_mod <- bas_1[order(bas_1$Caja),]

ff <- as.numeric(tapply(datos_mod$SUELDO,bas_1$Caja,median))


# Distribución de puestos y sueldos de los trabajadores de la empresa TIENDAS POR DEPARTAMENTO RIPLEY S.A.  Estructura de bandas salariales. 
png(filename = bandasPath, width = 640, height = 480, units = "px")




plot(x2,y2,xlim = c(200,1000),ylim = c(500,max(ff)*1.35+2000),type = "l", xlab = "Valoración de puestos",  ylab = "Remuneración",col="red",lwd=2,yaxt="n",xaxt="n")
par(new=T)
plot(x=datos_mod$PUNTOS , y=datos_mod$SUELDO,xlim = c(200,1000),ylim = c(500,max(ff)*1.35+2000),xlab = " ", ylab = " ",
     main = "Distribución de Valoración de Puestos y la Remuneración" ,pch=20,cex=0.7,yaxt="n",xaxt="n",cex.main=1,cex.lab=0.8,)
axis(2, at = seq(2000,max(ff)*1.35+2000,2000) , cex.axis=0.7)
axis(1, at = seq(200,1000,100) , cex.axis=0.7)


f_lim <- NULL
if (min(datos_mod$PUNTOS)<300){
  f_lim<- c(200,300,400,550,700,850,1000)
} else {
  f_lim<- c(300,400,550,700,850,1000)
}
f_lim <- as.numeric(f_lim)      


gc <- 1
while (gc <= max(datos_mod$Caja))
{
  segments(f_lim[gc], ff[gc]*0.65,   f_lim[gc], ff[gc]*1.35, lty = 2);segments(f_lim[gc+1], ff[gc]*0.65, f_lim[gc+1], ff[gc]*1.35, lty = 2)
  segments(f_lim[gc], ff[gc]*1.35, f_lim[gc+1], ff[gc]*1.35, lty = 2);segments(f_lim[gc], ff[gc]*0.65, f_lim[gc+1], ff[gc]*0.65, lty = 2)
  gc <- gc + 1 # esta es la manera de incrementar en R (no hay x++)
}

dev.off()




##########################################################################################
##########################################################################################
# EQUIDAD

needs(dplyr)
dattt <- datos %>% select(GENERO,CARGO,Puntos,Ingreso)
names(dattt) <-c( "GENERO" , "Puesto" , "Puntaje", "Sueldo" )

needs(stringr)
dattt$GENERO <- chartr('·eio˙¡eio⁄','aeiouAEIOU',dattt$GENERO)
dattt$GENERO <- str_to_upper(dattt$GENERO, locale = "es")

for (gen in 1:nrow(dattt)) {
  dattt[gen,1] <- ifelse(dattt[gen,1]=="HOMBRE","MASCULINO",dattt[gen,1])
  dattt[gen,1] <- ifelse(dattt[gen,1]=="MUJER","FEMENINO",dattt[gen,1])
  dattt[gen,1] <- ifelse(dattt[gen,1]=="F","FEMENINO",dattt[gen,1])
  dattt[gen,1] <- ifelse(dattt[gen,1]=="M","MASCULINO",dattt[gen,1])
}  ; rm(gen)

dattt$GENERO <- as.factor(dattt$GENERO)
SUM <- dattt$Puntaje

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
bas_1 <- data.frame(dattt,Caja)
bas_1 <- bas_1[order(bas_1$Caja),]
bas_1$GENERO <- as.factor(bas_1$GENERO)

# CREANDO MEDIANAS POR GENERO
med_gen<- c()
pvalor <- c()
for (iii in 1:max(bas_1$Caja)) {
  bh_1 <- subset(bas_1,bas_1$Caja==iii)
  bh1_H <- subset(bh_1,bh_1$GENERO=="MASCULINO")
  bh1_M <- subset(bh_1,bh_1$GENERO=="FEMENINO")
  N_H <- nrow(bh1_H) ; N_M <- nrow(bh1_M)
  med <- as.numeric(tapply(bh_1$Sueldo,bh_1$GENERO,median))

  if ((N_H==0|N_M==0)) { wil_1 = 0}
  else {wil_1 <- round(wilcox.test(bh1_H$Sueldo,bh1_M$Sueldo,paired = FALSE)$p.value,digits=4)}

  med_gen <- rbind(med_gen,round(med,0))
  pvalor <- rbind(pvalor,wil_1)
}

resultado <- data.frame(med_gen,pvalor)
row.names(resultado ) <- seq(1,max(bas_1$Caja))
# pv <- rep(0,nrow(resultado))
# for (u in 1:nrow(resultado)) {
#   pv[u]=ifelse(resultado[u,3]==0,"No aplica",
#                ifelse(resultado[u,3]>=0.05,"No hay diferencias/Ingresos similares","Hay diferencias/Ingresos distintos"))
# }
# resultado1 <-data.frame(resultado,pv)
# 
# for (u in 1:nrow(resultado1)) {
#   resultado1[u,3]= as.double(round(as.double(resultado1[u,3]),digits=2))
# }
# 
# resultado1$pvalor <- as.character(resultado1$pvalor)
# 
# for (u in 1:nrow(resultado1)) {
#   resultado1[u,3]=ifelse( is.na(resultado1[u,1]) || is.na(resultado1[u,2]),"No aplica", resultado1[u,3])
# }

ff <- as.numeric(tapply(bas_1$Sueldo,bas_1$Caja,median))

needs(dplyr)
SUM <- bas_1$Puntaje
Cj <- c()
if (min(SUM)<300){
  Cj <- data.frame(x1=seq(1,6,1),
                   x2=c(200,300,400,550,700,850),
                   x3=c(245,345,470,620,770,920),
                   x4=c(255,355,475,625,775,925),
                   x5=c(300,400,550,700,850,1000)) 
} else {
  Cj <- data.frame(x1=seq(1,5,1),
                   x2=c(300,400,550,700,850),
                   x3=c(345,470,620,770,920),
                   x4=c(355,475,625,775,925),
                   x5=c(400,550,700,850,1000)) } 

needs(dplyr)

Cj <- Cj[1:max(bas_1$Caja),]

Cj <- data.frame(Cj,med_gen)
names(Cj) <- c("Caja","LimInf_M","LimSup_M","LimInf_H","LimSup_H","Medi_M","Medi_H") ;row.names(Cj) <- NULL
Cj <- Cj %>% mutate(Med_T_M=Medi_M*1.35 , Med_B_M=Medi_M*0.65 ,Med_T_H=Medi_H*1.35 , Med_B_H=Medi_H*0.65)


if( is.na(max(Cj$Med_T_M)) || is.na(max(Cj$Med_T_H)) ){
  if (is.na(max(Cj$Med_T_M))) {
    LIM_y=max(Cj$Med_T_H)
  } else {
    LIM_y=max(Cj$Med_T_M) }
} else { 
  LIM_y <-ifelse( max(Cj$Med_T_M) > max(Cj$Med_T_H)  , max(Cj$Med_T_M)+1500, max(Cj$Med_T_H)+1500)}

LIM_x <- ifelse( max(bas_1$Puntaje)>600 && max(bas_1$Puntaje)<700,750,
                 ifelse( max(bas_1$Puntaje)>700 && max(bas_1$Puntaje)<850,900,1000))

lim_x <- ifelse(min(SUM)<300,200,250)



png(filename = equidadPath, width = 640, height = 480, units = "px")



plot(x=NULL , y=NULL,xlim = c(lim_x,LIM_x),ylim = c(500,LIM_y),xlab = "Número de bandas", ylab = "Remuneración",   main = "Distribución de Remuneraciones por Genero", pch=20,cex=1,yaxt="n",xaxt="n",cex.main=0.9,cex.lab=0.8)
axis(2, at = seq(2000,LIM_y,2000) , cex.axis=0.7)

# rect(xleft, ybottom, xright, ytop)
for (i in 1:max(Cj$Caja)) {
  if(is.na(Cj$Medi_M[i])){
    text(x=5000,y=1000, " ") 
  } else{
    rect(Cj$LimInf_M[i], Cj$Med_B_M[i], Cj$LimSup_M[i], Cj$Med_T_M[i],col="#FFAF33")
    segments(Cj$LimInf_M[i], Cj$Medi_M[i], Cj$LimSup_M[i], Cj$Medi_M[i], lwd = 2)
  }
  if(is.na(Cj$Medi_H[i])){
    text(x=5000,y=1000, " ") 
  } else{
    rect(Cj$LimInf_H[i], Cj$Med_B_H[i], Cj$LimSup_H[i], Cj$Med_T_H[i],col="#58A1DA")
    segments(Cj$LimInf_H[i], Cj$Medi_H[i], Cj$LimSup_H[i], Cj$Medi_H[i], lwd = 2)
  }  
}


if(Cj$LimInf_M[1]==200){
  
  if(max(Cj$Caja)==3){
    segments(300, 0, 300, 100000, lty = 2)
    segments(400, 0, 400, 100000, lty = 2)
    
    text(x=mean(c(Cj$LimInf_M[1],Cj$LimSup_H[1])),y=450,"1",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[2],Cj$LimSup_H[2])),y=450,"2",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[3],Cj$LimSup_H[3])),y=450,"3",cex = 1.5)    
  }
  if(max(Cj$Caja)==4){
    segments(300, 0, 300, 100000, lty = 2)
    segments(400, 0, 400, 100000, lty = 2)
    segments(550, 0, 550, 100000, lty = 2)
    
    text(x=mean(c(Cj$LimInf_M[1],Cj$LimSup_H[1])),y=450,"1",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[2],Cj$LimSup_H[2])),y=450,"2",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[3],Cj$LimSup_H[3])),y=450,"3",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[4],Cj$LimSup_H[4])),y=450,"4",cex = 1.5)
    
  }
  if(max(Cj$Caja)==5){
    segments(300, 0, 300, 100000, lty = 2)
    segments(400, 0, 400, 100000, lty = 2)
    segments(550, 0, 550, 100000, lty = 2)
    segments(700, 0, 700, 100000, lty = 2)
    
    text(x=mean(c(Cj$LimInf_M[1],Cj$LimSup_H[1])),y=450,"1",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[2],Cj$LimSup_H[2])),y=450,"2",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[3],Cj$LimSup_H[3])),y=450,"3",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[4],Cj$LimSup_H[4])),y=450,"4",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[5],Cj$LimSup_H[5])),y=450,"5",cex = 1.5)
  }
  if(max(Cj$Caja)==6){
    segments(300, 0, 300, 100000, lty = 2)
    segments(400, 0, 400, 100000, lty = 2)
    segments(550, 0, 550, 100000, lty = 2)
    segments(700, 0, 700, 100000, lty = 2)
    segments(850, 0, 850, 100000, lty = 2)
    
    text(x=mean(c(Cj$LimInf_M[1],Cj$LimSup_H[1])),y=450,"1",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[2],Cj$LimSup_H[2])),y=450,"2",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[3],Cj$LimSup_H[3])),y=450,"3",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[4],Cj$LimSup_H[4])),y=450,"4",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[5],Cj$LimSup_H[5])),y=450,"5",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[6],Cj$LimSup_H[6])),y=450,"6",cex = 1.5)
  }
} else {
  if(max(Cj$Caja)==3){
    segments(400, 0, 400, 100000, lty = 2)
    segments(550, 0, 550, 100000, lty = 2)
    
    text(x=mean(c(Cj$LimInf_M[1],Cj$LimSup_H[1])),y=450,"1",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[2],Cj$LimSup_H[2])),y=450,"2",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[3],Cj$LimSup_H[3])),y=450,"3",cex = 1.5)    
  }
  if(max(Cj$Caja)==4){
    segments(400, 0, 400, 100000, lty = 2)
    segments(550, 0, 550, 100000, lty = 2)
    segments(550, 0, 550, 100000, lty = 2)
    segments(700, 0, 700, 100000, lty = 2)
    
    text(x=mean(c(Cj$LimInf_M[1],Cj$LimSup_H[1])),y=450,"1",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[2],Cj$LimSup_H[2])),y=450,"2",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[3],Cj$LimSup_H[3])),y=450,"3",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[4],Cj$LimSup_H[4])),y=450,"4",cex = 1.5)
    
  }
  if(max(Cj$Caja)==5){
    segments(400, 0, 400, 100000, lty = 2)
    segments(550, 0, 550, 100000, lty = 2)
    segments(700, 0, 700, 100000, lty = 2)
    segments(850, 0, 850, 100000, lty = 2)
    
    text(x=mean(c(Cj$LimInf_M[1],Cj$LimSup_H[1])),y=450,"1",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[2],Cj$LimSup_H[2])),y=450,"2",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[3],Cj$LimSup_H[3])),y=450,"3",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[4],Cj$LimSup_H[4])),y=450,"4",cex = 1.5)
    text(x=mean(c(Cj$LimInf_M[5],Cj$LimSup_H[5])),y=450,"5",cex = 1.5)
  }
}

dev.off()








