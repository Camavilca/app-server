import {
  CARATULA,
  DESCRIPCION,
  RENUMERATIVA,
  ASCENSOS,
  HOSTIGAMIENTO,
  CAPACITACION,
  CONCILIACION,
  ANEXOS,
} from "../../../constant/equality/empresa/documentos/names";

export default [
  {
    name: "Caratula.docx",
    type: CARATULA,
    isView: false,
  },
  {
    name: "1. DESCRIPCIÓN.docx",
    type: DESCRIPCION,
    isView: true,
  },
  {
    name: "2. POLITICA REMUNERATIVA.docx",
    type: RENUMERATIVA,
    isView: true,
  },
  {
    name: "3. POLITICA DE ASCENSOS.docx",
    type: ASCENSOS,
    isView: true,
  },
  {
    name: "4. POLÍTICA DE PREVENCIÓN DEL HOSTIGAMIENTO SEXUAL.docx",
    type: HOSTIGAMIENTO,
    isView: true,
  },
  {
    name: "5. POLÍTICA DE CAPACITACIÓN Y DESARROLLO ORGANIZACIONAL.docx",
    type: CAPACITACION,
    isView: true,
  },
  {
    name: "6. POLÍTICA DE CONCILIACIÓN DE VIDA PERSONAL.docx",
    type: CONCILIACION,
    isView: true,
  },
  {
    name: "Anexos.docx",
    type: ANEXOS,
    isView: true,
  },
];
