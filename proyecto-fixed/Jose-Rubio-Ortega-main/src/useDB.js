import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";

const load = (key, fallback) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

/* ── 12 GRUPOS: 1A 1B 2A 2B 3A 3B 4A 4B 5A 5B 6A 6B ── */
const SEED_GRUPOS = [
  { id:"1A", nombre:"1° A", grado:1, salon:"Aula 1",  maestroId:"m1",  turno:"Matutino" },
  { id:"1B", nombre:"1° B", grado:1, salon:"Aula 2",  maestroId:"m2",  turno:"Matutino" },
  { id:"2A", nombre:"2° A", grado:2, salon:"Aula 3",  maestroId:"m3",  turno:"Matutino" },
  { id:"2B", nombre:"2° B", grado:2, salon:"Aula 4",  maestroId:"m4",  turno:"Matutino" },
  { id:"3A", nombre:"3° A", grado:3, salon:"Aula 5",  maestroId:"m5",  turno:"Matutino" },
  { id:"3B", nombre:"3° B", grado:3, salon:"Aula 6",  maestroId:"m6",  turno:"Matutino" },
  { id:"4A", nombre:"4° A", grado:4, salon:"Aula 7",  maestroId:"m7",  turno:"Matutino" },
  { id:"4B", nombre:"4° B", grado:4, salon:"Aula 8",  maestroId:"m8",  turno:"Matutino" },
  { id:"5A", nombre:"5° A", grado:5, salon:"Aula 9",  maestroId:"m9",  turno:"Matutino" },
  { id:"5B", nombre:"5° B", grado:5, salon:"Aula 10", maestroId:"m10", turno:"Matutino" },
  { id:"6A", nombre:"6° A", grado:6, salon:"Aula 11", maestroId:"m11", turno:"Matutino" },
  { id:"6B", nombre:"6° B", grado:6, salon:"Aula 12", maestroId:"m12", turno:"Matutino" },
];

/* ── 12 MAESTROS — primaria, cada uno titular de un grupo ── */
const SEED_MAESTROS = [
  { id:"m1",  nombre:"Ana Lucía Ramírez Peña",      email:"aramírez@escuela.edu",  tel:"6561001001", grupo:"1A", usuario:"m1",   pass:"1111", activo:true },
  { id:"m2",  nombre:"Carlos Mendoza Herrera",       email:"cmendoza@escuela.edu",  tel:"6561001002", grupo:"1B", usuario:"m2",   pass:"1111", activo:true },
  { id:"m3",  nombre:"Patricia Soto Villanueva",     email:"psoto@escuela.edu",     tel:"6561001003", grupo:"2A", usuario:"m3",   pass:"1111", activo:true },
  { id:"m4",  nombre:"Javier Estrada Torres",        email:"jestrada@escuela.edu",  tel:"6561001004", grupo:"2B", usuario:"m4",   pass:"1111", activo:true },
  { id:"m5",  nombre:"María Fernanda Ríos Cano",     email:"mrios@escuela.edu",     tel:"6561001005", grupo:"3A", usuario:"m5",   pass:"1111", activo:true },
  { id:"m6",  nombre:"Roberto Leal Gutiérrez",       email:"rleal@escuela.edu",     tel:"6561001006", grupo:"3B", usuario:"m6",   pass:"1111", activo:true },
  { id:"m7",  nombre:"Verónica Castillo Morales",    email:"vcastillo@escuela.edu", tel:"6561001007", grupo:"4A", usuario:"m7",   pass:"1111", activo:true },
  { id:"m8",  nombre:"Eduardo Salas Ortega",         email:"esalas@escuela.edu",    tel:"6561001008", grupo:"4B", usuario:"m8",   pass:"1111", activo:true },
  { id:"m9",  nombre:"Gabriela Núñez Espinoza",      email:"gnunez@escuela.edu",    tel:"6561001009", grupo:"5A", usuario:"m9",   pass:"1111", activo:true },
  { id:"m10", nombre:"Arturo Vega Domínguez",        email:"avega@escuela.edu",     tel:"6561001010", grupo:"5B", usuario:"m10",  pass:"1111", activo:true },
  { id:"m11", nombre:"Silvia Guerrero Pacheco",      email:"sguerrero@escuela.edu", tel:"6561001011", grupo:"6A", usuario:"m11",  pass:"1111", activo:true },
  { id:"m12", nombre:"Hugo Flores Ibarra",           email:"hflores@escuela.edu",   tel:"6561001012", grupo:"6B", usuario:"m12",  pass:"1111", activo:true },
];

/* ── 120 ALUMNOS — 10 por grupo ── */
const SEED_ALUMNOS = [
  // ── 1A ──
  { id:"a1a1",  nombre:"Sofía Ramírez Torres",       fechaNac:"2018-03-12", curp:"RATS180312MJCMRS01", grupo:"1A", tutor:"Laura Torres",        tel:"6562001001", email:"ltorres@mail.com",     sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a1a2",  nombre:"Emilio Castro Fuentes",      fechaNac:"2018-07-04", curp:"CAFE180704HJCSTR02", grupo:"1A", tutor:"Pedro Castro",         tel:"6562001002", email:"pcastro@mail.com",     sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a1a3",  nombre:"Valeria Medina Ríos",        fechaNac:"2018-01-22", curp:"MERV180122MJCDRS03", grupo:"1A", tutor:"Rosa Ríos",            tel:"6562001003", email:"rrios@mail.com",       sangre:"B+",  alergias:"Penicilina", activo:true },
  { id:"a1a4",  nombre:"Ángel Ortega Leal",          fechaNac:"2018-05-30", curp:"OELA180530HJCRLN04", grupo:"1A", tutor:"Carmen Leal",          tel:"6562001004", email:"cleal@mail.com",       sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a1a5",  nombre:"Daniela Vega Morales",       fechaNac:"2018-09-14", curp:"VEMD180914MJCGRS05", grupo:"1A", tutor:"Jorge Vega",           tel:"6562001005", email:"jvega@mail.com",       sangre:"AB+", alergias:"Ninguna",    activo:true },
  { id:"a1a6",  nombre:"Rodrigo Luna Soto",          fechaNac:"2018-02-28", curp:"LUSR180228HJCNTS06", grupo:"1A", tutor:"María Soto",           tel:"6562001006", email:"msoto@mail.com",       sangre:"A-",  alergias:"Látex",      activo:true },
  { id:"a1a7",  nombre:"Fernanda Díaz Pérez",        fechaNac:"2018-11-08", curp:"DIPF181108MJCZRS07", grupo:"1A", tutor:"Luis Díaz",            tel:"6562001007", email:"ldiaz@mail.com",       sangre:"B-",  alergias:"Ninguna",    activo:true },
  { id:"a1a8",  nombre:"Samuel Torres Guzmán",       fechaNac:"2018-04-16", curp:"TOGS180416HJCRRM08", grupo:"1A", tutor:"Elena Guzmán",         tel:"6562001008", email:"eguzman@mail.com",     sangre:"O-",  alergias:"Polen",      activo:true },
  { id:"a1a9",  nombre:"Camila Flores Ibarra",       fechaNac:"2018-08-22", curp:"FLIC180822MJCLBR09", grupo:"1A", tutor:"Marco Flores",         tel:"6562001009", email:"mflores@mail.com",     sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a1a10", nombre:"Mateo Reyes Cruz",           fechaNac:"2018-12-01", curp:"RECM181201HJCYZR10", grupo:"1A", tutor:"Alicia Cruz",          tel:"6562001010", email:"acruz@mail.com",       sangre:"O+",  alergias:"Ninguna",    activo:true },
  // ── 1B ──
  { id:"a1b1",  nombre:"Diego Hernández López",      fechaNac:"2018-07-20", curp:"HELD180720HJCDRL01", grupo:"1B", tutor:"Carlos Hernández",     tel:"6562001011", email:"chernandez@mail.com",  sangre:"A+",  alergias:"Penicilina", activo:true },
  { id:"a1b2",  nombre:"Lucía Vargas Salinas",       fechaNac:"2018-03-05", curp:"VASL180305MJCRLN02", grupo:"1B", tutor:"Ana Vargas",           tel:"6562001012", email:"avargas@mail.com",     sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a1b3",  nombre:"Andrés Espinoza Núñez",      fechaNac:"2018-06-18", curp:"ESNA180618HJCSPN03", grupo:"1B", tutor:"Silvia Núñez",         tel:"6562001013", email:"snunez@mail.com",      sangre:"B+",  alergias:"Ninguna",    activo:true },
  { id:"a1b4",  nombre:"Isabela Domínguez Torres",   fechaNac:"2018-10-30", curp:"DOTI181030MJCMRR04", grupo:"1B", tutor:"Felipe Torres",        tel:"6562001014", email:"ftorres@mail.com",     sangre:"AB+", alergias:"Látex",      activo:true },
  { id:"a1b5",  nombre:"Miguel Salinas Ramos",       fechaNac:"2018-02-14", curp:"SARM180214HJCLMM05", grupo:"1B", tutor:"Griselda Ramos",       tel:"6562001015", email:"gramos@mail.com",      sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a1b6",  nombre:"Renata Chávez Mendoza",      fechaNac:"2018-08-09", curp:"CHMR180809MJCVND06", grupo:"1B", tutor:"Tomás Chávez",         tel:"6562001016", email:"tchavez@mail.com",     sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a1b7",  nombre:"Óscar Fuentes Arias",        fechaNac:"2018-04-22", curp:"FUAO180422HJCNTR07", grupo:"1B", tutor:"Esperanza Arias",      tel:"6562001017", email:"earias@mail.com",      sangre:"B-",  alergias:"Ninguna",    activo:true },
  { id:"a1b8",  nombre:"Mariana Acosta Vega",        fechaNac:"2018-12-17", curp:"ACVM181217MJCSTG08", grupo:"1B", tutor:"Ricardo Acosta",       tel:"6562001018", email:"racosta@mail.com",     sangre:"O+",  alergias:"Polen",      activo:true },
  { id:"a1b9",  nombre:"Josué Moreno Castillo",      fechaNac:"2018-01-03", curp:"MOCJ180103HJCRNS09", grupo:"1B", tutor:"Norma Castillo",       tel:"6562001019", email:"ncastillo@mail.com",   sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a1b10", nombre:"Paola Gutiérrez Lara",       fechaNac:"2018-09-27", curp:"GULP180927MJCTRR10", grupo:"1B", tutor:"Ernesto Lara",         tel:"6562001020", email:"elara@mail.com",       sangre:"O+",  alergias:"Mariscos",   activo:true },
  // ── 2A ──
  { id:"a2a1",  nombre:"Valentina Cruz Morales",     fechaNac:"2017-11-05", curp:"CUMV171105MJCRRL01", grupo:"2A", tutor:"Patricia Morales",     tel:"6562002001", email:"pmorales@mail.com",    sangre:"B+",  alergias:"Ninguna",    activo:true },
  { id:"a2a2",  nombre:"Bruno Guerrero Ruiz",        fechaNac:"2017-05-12", curp:"GURB170512HJCRRL02", grupo:"2A", tutor:"Sandra Ruiz",          tel:"6562002002", email:"sruiz@mail.com",       sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a2a3",  nombre:"Ximena Pacheco Vidal",       fechaNac:"2017-08-29", curp:"PAVX170829MJCCHDL03", grupo:"2A", tutor:"Marcos Pacheco",      tel:"6562002003", email:"mpacheco@mail.com",    sangre:"A+",  alergias:"Penicilina", activo:true },
  { id:"a2a4",  nombre:"Leonardo Ibarra Santos",     fechaNac:"2017-02-07", curp:"IBSL170207HJCBRN04", grupo:"2A", tutor:"Verónica Santos",      tel:"6562002004", email:"vsantos@mail.com",     sangre:"AB+", alergias:"Ninguna",    activo:true },
  { id:"a2a5",  nombre:"Adriana López Campos",       fechaNac:"2017-06-15", curp:"LOCA170615MJCPMS05", grupo:"2A", tutor:"Gabriel López",        tel:"6562002005", email:"glopez@mail.com",      sangre:"O-",  alergias:"Látex",      activo:true },
  { id:"a2a6",  nombre:"Tomás Serrano Díaz",         fechaNac:"2017-10-22", curp:"SEDT171022HJCRRM06", grupo:"2A", tutor:"Irene Díaz",           tel:"6562002006", email:"idiaz@mail.com",       sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a2a7",  nombre:"Natalia Rojas Fuentes",      fechaNac:"2017-03-18", curp:"ROFN170318MJCJSN07", grupo:"2A", tutor:"Hector Rojas",         tel:"6562002007", email:"hrojas@mail.com",      sangre:"B-",  alergias:"Ninguna",    activo:true },
  { id:"a2a8",  nombre:"Rodrigo Peña Aguilar",       fechaNac:"2017-07-30", curp:"PEAR170730HJCNGL08", grupo:"2A", tutor:"Beatriz Aguilar",      tel:"6562002008", email:"baguilar@mail.com",    sangre:"O+",  alergias:"Polen",      activo:true },
  { id:"a2a9",  nombre:"Alexia Montes Ramos",        fechaNac:"2017-12-04", curp:"MORA171204MJCNTR09", grupo:"2A", tutor:"David Montes",         tel:"6562002009", email:"dmontes@mail.com",     sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a2a10", nombre:"Iván Álvarez Pedroza",       fechaNac:"2017-04-25", curp:"ALPI170425HJCLVZ10", grupo:"2A", tutor:"Claudia Pedroza",      tel:"6562002010", email:"cpedroza@mail.com",    sangre:"O+",  alergias:"Ninguna",    activo:true },
  // ── 2B ──
  { id:"a2b1",  nombre:"Mateo García Pérez",         fechaNac:"2017-02-28", curp:"GAPM170228HJCRRL01", grupo:"2B", tutor:"Roberto García",       tel:"6562002011", email:"rgarcia@mail.com",     sangre:"AB+", alergias:"Látex",      activo:true },
  { id:"a2b2",  nombre:"Alicia Mendoza León",        fechaNac:"2017-09-13", curp:"MELA170913MJCNDZ02", grupo:"2B", tutor:"Jorge Mendoza",        tel:"6562002012", email:"jmendoza@mail.com",    sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a2b3",  nombre:"Carlos Rueda Vázquez",       fechaNac:"2017-05-20", curp:"RUVC170520HJCDVZ03", grupo:"2B", tutor:"Leticia Vázquez",      tel:"6562002013", email:"lvazquez@mail.com",    sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a2b4",  nombre:"Paola Herrera Lozano",       fechaNac:"2017-01-07", curp:"HELP170107MJCRRL04", grupo:"2B", tutor:"Alfredo Lozano",       tel:"6562002014", email:"alozano@mail.com",     sangre:"B+",  alergias:"Penicilina", activo:true },
  { id:"a2b5",  nombre:"Eduardo Velázquez Ríos",     fechaNac:"2017-11-29", curp:"VERE171129HJCLDS05", grupo:"2B", tutor:"Marcela Ríos",         tel:"6562002015", email:"mrios@mail.com",       sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a2b6",  nombre:"Fernanda Torres Nava",       fechaNac:"2017-07-16", curp:"TONF170716MJCRRS06", grupo:"2B", tutor:"Gerardo Torres",       tel:"6562002016", email:"gtorres@mail.com",     sangre:"AB-", alergias:"Ninguna",    activo:true },
  { id:"a2b7",  nombre:"Sebastián Campos Ortiz",     fechaNac:"2017-03-05", curp:"CAOS170305HJCMPS07", grupo:"2B", tutor:"Yolanda Ortiz",        tel:"6562002017", email:"yortiz@mail.com",      sangre:"A-",  alergias:"Polen",      activo:true },
  { id:"a2b8",  nombre:"Renata Jiménez Silva",       fechaNac:"2017-08-22", curp:"JISR170822MJCMNZ08", grupo:"2B", tutor:"Arturo Silva",         tel:"6562002018", email:"asilva@mail.com",      sangre:"B-",  alergias:"Ninguna",    activo:true },
  { id:"a2b9",  nombre:"Oscar Contreras Palma",      fechaNac:"2017-06-11", curp:"COPO170611HJCNTR09", grupo:"2B", tutor:"Diana Palma",          tel:"6562002019", email:"dpalma@mail.com",      sangre:"O+",  alergias:"Mariscos",   activo:true },
  { id:"a2b10", nombre:"Sofía Estrada Reyes",        fechaNac:"2017-04-03", curp:"ESRS170403MJCSTR10", grupo:"2B", tutor:"Francisco Reyes",      tel:"6562002020", email:"freyes@mail.com",      sangre:"A+",  alergias:"Ninguna",    activo:true },
  // ── 3A ──
  { id:"a3a1",  nombre:"Isabella Martínez Soto",     fechaNac:"2016-09-14", curp:"MASI160914MJCRTB01", grupo:"3A", tutor:"Ana Soto",             tel:"6562003001", email:"asoto@mail.com",       sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a3a2",  nombre:"David Ramírez Peña",         fechaNac:"2016-04-02", curp:"RAPD160402HJCMZS02", grupo:"3A", tutor:"Isabel Peña",          tel:"6562003002", email:"ipena@mail.com",       sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a3a3",  nombre:"Gabriela Salas Mora",        fechaNac:"2016-12-20", curp:"SAMG161220MJCLRS03", grupo:"3A", tutor:"Ernesto Mora",         tel:"6562003003", email:"emora@mail.com",       sangre:"B+",  alergias:"Penicilina", activo:true },
  { id:"a3a4",  nombre:"Nicolás Varela Cruz",        fechaNac:"2016-02-15", curp:"VACN160215HJCRLZ04", grupo:"3A", tutor:"Pilar Cruz",           tel:"6562003004", email:"pcruz@mail.com",       sangre:"AB+", alergias:"Látex",      activo:true },
  { id:"a3a5",  nombre:"Alejandra Ponce Rivas",      fechaNac:"2016-06-28", curp:"PORA160628MJCNCA05", grupo:"3A", tutor:"Manuel Rivas",         tel:"6562003005", email:"mrivas@mail.com",      sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a3a6",  nombre:"Emiliano Vidal Flores",      fechaNac:"2016-10-09", curp:"VIFE161009HJCDLM06", grupo:"3A", tutor:"Rocío Flores",         tel:"6562003006", email:"rflores@mail.com",     sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a3a7",  nombre:"Camila Ávila Navarro",       fechaNac:"2016-05-17", curp:"AVNC160517MJCVLR07", grupo:"3A", tutor:"Jesús Navarro",        tel:"6562003007", email:"jnavarro@mail.com",    sangre:"B-",  alergias:"Polen",      activo:true },
  { id:"a3a8",  nombre:"Diego Cano Espinoza",        fechaNac:"2016-08-31", curp:"CAED160831HJCNSP08", grupo:"3A", tutor:"Laura Espinoza",       tel:"6562003008", email:"lespinoza@mail.com",   sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a3a9",  nombre:"Ana Paula Guerrero León",    fechaNac:"2016-01-26", curp:"GELA161126MJCRRA09", grupo:"3A", tutor:"Roberto Guerrero",     tel:"6562003009", email:"rguerrero@mail.com",   sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a3a10", nombre:"Maximiliano Torres Daza",    fechaNac:"2016-07-14", curp:"TODM160714HJCRRS10", grupo:"3A", tutor:"Patricia Daza",        tel:"6562003010", email:"pdaza@mail.com",       sangre:"AB-", alergias:"Mariscos",   activo:true },
  // ── 3B ──
  { id:"a3b1",  nombre:"Sebastián Flores Ruiz",      fechaNac:"2016-04-30", curp:"FORS160430HJCLLB01", grupo:"3B", tutor:"Jorge Flores",         tel:"6562003011", email:"jflores@mail.com",     sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a3b2",  nombre:"Valentina Mora Espinoza",    fechaNac:"2016-08-15", curp:"MOEV160815MJCRSN02", grupo:"3B", tutor:"Oscar Mora",           tel:"6562003012", email:"omora@mail.com",       sangre:"O+",  alergias:"Penicilina", activo:true },
  { id:"a3b3",  nombre:"Luis Enrique Ruiz Soto",     fechaNac:"2016-01-10", curp:"RUSL161010HJCIZTS03", grupo:"3B", tutor:"Sandra Soto",         tel:"6562003013", email:"ssoto@mail.com",       sangre:"B+",  alergias:"Ninguna",    activo:true },
  { id:"a3b4",  nombre:"Sofía Delgado Ramos",        fechaNac:"2016-11-22", curp:"DESH161122MJCLGR04", grupo:"3B", tutor:"Hugo Ramos",           tel:"6562003014", email:"hramos@mail.com",      sangre:"AB+", alergias:"Látex",      activo:true },
  { id:"a3b5",  nombre:"Jorge Alberto Leal García",  fechaNac:"2016-05-08", curp:"LEGJ160508HJCLRB05", grupo:"3B", tutor:"Cecilia García",       tel:"6562003015", email:"cgarcia@mail.com",     sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a3b6",  nombre:"Mariana Castillo Aguilar",   fechaNac:"2016-09-25", curp:"CAAM160925MJCSTL06", grupo:"3B", tutor:"Felipe Castillo",      tel:"6562003016", email:"fcastillo@mail.com",   sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a3b7",  nombre:"Fernando Ríos Blanco",       fechaNac:"2016-03-14", curp:"RIBF160314HJCSOS07", grupo:"3B", tutor:"Carmen Blanco",        tel:"6562003017", email:"cblanco@mail.com",     sangre:"B-",  alergias:"Polen",      activo:true },
  { id:"a3b8",  nombre:"Andrea Vega Medina",         fechaNac:"2016-07-03", curp:"VEMA160703MJCGDR08", grupo:"3B", tutor:"Alfonso Medina",       tel:"6562003018", email:"amedina@mail.com",     sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a3b9",  nombre:"Ernesto Padilla Herrera",    fechaNac:"2016-12-19", curp:"PAHE161219HJCDLR09", grupo:"3B", tutor:"Brenda Herrera",       tel:"6562003019", email:"bherrera@mail.com",    sangre:"AB-", alergias:"Ninguna",    activo:true },
  { id:"a3b10", nombre:"Diana Salas Montes",         fechaNac:"2016-06-07", curp:"SAMD160607MJCLSN10", grupo:"3B", tutor:"Ignacio Montes",       tel:"6562003020", email:"imontes@mail.com",     sangre:"A-",  alergias:"Mariscos",   activo:true },
  // ── 4A ──
  { id:"a4a1",  nombre:"Camila Reyes González",      fechaNac:"2015-12-08", curp:"REGC151208MJCYNB01", grupo:"4A", tutor:"Mónica González",      tel:"6562004001", email:"mgonzalez@mail.com",   sangre:"B-",  alergias:"Ninguna",    activo:true },
  { id:"a4a2",  nombre:"Rodrigo Álvarez Peña",       fechaNac:"2015-03-22", curp:"ALPR150322HJCLVZ02", grupo:"4A", tutor:"Miriam Peña",          tel:"6562004002", email:"mpena@mail.com",       sangre:"O+",  alergias:"Penicilina", activo:true },
  { id:"a4a3",  nombre:"Pamela Soto Fuentes",        fechaNac:"2015-09-16", curp:"SOFP150916MJCTNT03", grupo:"4A", tutor:"Ramón Soto",           tel:"6562004003", email:"rsoto@mail.com",       sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a4a4",  nombre:"Carlos Jiménez Varela",      fechaNac:"2015-06-05", curp:"JIVC150605HJCMNS04", grupo:"4A", tutor:"Elvira Varela",        tel:"6562004004", email:"evarela@mail.com",     sangre:"AB+", alergias:"Látex",      activo:true },
  { id:"a4a5",  nombre:"Yazmín Torres Lara",         fechaNac:"2015-11-30", curp:"TOLY151130MJCRRS05", grupo:"4A", tutor:"Gustavo Lara",         tel:"6562004005", email:"glara@mail.com",       sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a4a6",  nombre:"Diego Carrillo Mendoza",     fechaNac:"2015-04-13", curp:"CAMD150413HJCRRN06", grupo:"4A", tutor:"Angélica Mendoza",     tel:"6562004006", email:"amendoza@mail.com",    sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a4a7",  nombre:"Ariadna López Santos",       fechaNac:"2015-08-26", curp:"LOSA150826MJCPDS07", grupo:"4A", tutor:"Oswaldo Santos",       tel:"6562004007", email:"osantos@mail.com",     sangre:"B+",  alergias:"Polen",      activo:true },
  { id:"a4a8",  nombre:"Joel Serrano Rivas",         fechaNac:"2015-01-19", curp:"SERJ150119HJCRVS08", grupo:"4A", tutor:"Claudia Rivas",        tel:"6562004008", email:"crivas@mail.com",      sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a4a9",  nombre:"Brenda Núñez Campos",        fechaNac:"2015-10-07", curp:"NUCB151007MJCMPS09", grupo:"4A", tutor:"Enrique Campos",       tel:"6562004009", email:"ecampos@mail.com",     sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a4a10", nombre:"Mauricio Herrera Vega",      fechaNac:"2015-07-23", curp:"HEVM150723HJCRRG10", grupo:"4A", tutor:"Verónica Herrera",     tel:"6562004010", email:"vherrera@mail.com",    sangre:"AB-", alergias:"Mariscos",   activo:true },
  // ── 4B ──
  { id:"a4b1",  nombre:"Emiliano Vega Castro",       fechaNac:"2015-06-22", curp:"VECE150622HJCGBS01", grupo:"4B", tutor:"Eduardo Castro",       tel:"6562004011", email:"ecastro@mail.com",     sangre:"O+",  alergias:"Polen",      activo:true },
  { id:"a4b2",  nombre:"Itzel Domínguez Flores",     fechaNac:"2015-02-10", curp:"DOFI150210MJCMGL02", grupo:"4B", tutor:"Patricia Flores",      tel:"6562004012", email:"pflores@mail.com",     sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a4b3",  nombre:"Alan Guzmán Navarro",        fechaNac:"2015-10-28", curp:"GUNA151028HJCZMR03", grupo:"4B", tutor:"Dolores Navarro",      tel:"6562004013", email:"dnavarro@mail.com",    sangre:"B+",  alergias:"Penicilina", activo:true },
  { id:"a4b4",  nombre:"Nadia Ibarra Rueda",         fechaNac:"2015-05-15", curp:"IRAN150515MJCBRR04", grupo:"4B", tutor:"Salvador Ibarra",      tel:"6562004014", email:"sibarra@mail.com",     sangre:"AB+", alergias:"Látex",      activo:true },
  { id:"a4b5",  nombre:"Raúl Espinoza Molina",       fechaNac:"2015-09-02", curp:"EOMR150902HJCSPZ05", grupo:"4B", tutor:"Cristina Molina",      tel:"6562004015", email:"cmolina@mail.com",     sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a4b6",  nombre:"Daniela Morales Peña",       fechaNac:"2015-03-17", curp:"MOPD150317MJCRLS06", grupo:"4B", tutor:"Héctor Morales",       tel:"6562004016", email:"hmorales@mail.com",    sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a4b7",  nombre:"Alejandro Rojas Garza",      fechaNac:"2015-12-30", curp:"ROGA151230HJCJSR07", grupo:"4B", tutor:"Lucero Garza",         tel:"6562004017", email:"lgarza@mail.com",      sangre:"B-",  alergias:"Polen",      activo:true },
  { id:"a4b8",  nombre:"Violeta Cruz Aguilar",       fechaNac:"2015-07-08", curp:"CUAV150708MJCRZL08", grupo:"4B", tutor:"Noé Aguilar",          tel:"6562004018", email:"noaguilar@mail.com",   sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a4b9",  nombre:"Santiago Martínez Ramos",    fechaNac:"2015-04-23", curp:"MARS150423HJCRTS09", grupo:"4B", tutor:"Silvia Ramos",         tel:"6562004019", email:"sramos@mail.com",      sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a4b10", nombre:"Karla Fuentes Díaz",         fechaNac:"2015-11-11", curp:"FUDK151111MJCNTZ10", grupo:"4B", tutor:"Antonio Díaz",         tel:"6562004020", email:"adiaz@mail.com",       sangre:"AB-", alergias:"Mariscos",   activo:true },
  // ── 5A ──
  { id:"a5a1",  nombre:"Mariana López Salinas",      fechaNac:"2014-01-15", curp:"LOSM140115MJCRRL01", grupo:"5A", tutor:"Sandra Salinas",       tel:"6562005001", email:"ssalinas@mail.com",    sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a5a2",  nombre:"Axel García Mendoza",        fechaNac:"2014-07-28", curp:"GAMA140728HJCRXL02", grupo:"5A", tutor:"Leticia Mendoza",      tel:"6562005002", email:"lmendoza@mail.com",    sangre:"O+",  alergias:"Penicilina", activo:true },
  { id:"a3a3n", nombre:"Bianca Reyes Domínguez",     fechaNac:"2014-03-11", curp:"REDB140311MJCYSD03", grupo:"5A", tutor:"Marcos Domínguez",     tel:"6562005003", email:"mdominguez@mail.com",  sangre:"B+",  alergias:"Ninguna",    activo:true },
  { id:"a5a4",  nombre:"Eduardo Castillo Luna",      fechaNac:"2014-10-04", curp:"CALE141004HJCSTD04", grupo:"5A", tutor:"Irma Luna",            tel:"6562005004", email:"iluna@mail.com",       sangre:"AB+", alergias:"Látex",      activo:true },
  { id:"a5a5",  nombre:"Estrella Vázquez Torres",    fechaNac:"2014-05-19", curp:"VATE140519MJCZQR05", grupo:"5A", tutor:"Rafael Torres",        tel:"6562005005", email:"rtorres@mail.com",     sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a5a6",  nombre:"Emilio Núñez Soto",          fechaNac:"2014-09-07", curp:"NUSE140907HJCZMM06", grupo:"5A", tutor:"Adriana Soto",         tel:"6562005006", email:"adsoto@mail.com",      sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a5a7",  nombre:"Jimena Herrera Aguilar",     fechaNac:"2014-02-23", curp:"HEAJ140223MJCRRM07", grupo:"5A", tutor:"Saúl Aguilar",         tel:"6562005007", email:"saguilar@mail.com",    sangre:"B-",  alergias:"Polen",      activo:true },
  { id:"a5a8",  nombre:"Pablo Ortega Campos",        fechaNac:"2014-08-16", curp:"OECP140816HJCRTB08", grupo:"5A", tutor:"Verónica Campos",      tel:"6562005008", email:"vcampos@mail.com",     sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a5a9",  nombre:"Ariana Flores Espinoza",     fechaNac:"2014-06-05", curp:"FLEA140605MJCLLR09", grupo:"5A", tutor:"Esteban Flores",       tel:"6562005009", email:"eflores@mail.com",     sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a5a10", nombre:"Iván Torres Guzmán",         fechaNac:"2014-12-20", curp:"TOGI141220HJCRRN10", grupo:"5A", tutor:"Margarita Guzmán",     tel:"6562005010", email:"mguzman@mail.com",     sangre:"AB-", alergias:"Mariscos",   activo:true },
  // ── 5B ──
  { id:"a5b1",  nombre:"Fernando Ruiz Acosta",       fechaNac:"2014-08-03", curp:"RUAF140803HJCIZN01", grupo:"5B", tutor:"Fernando Ruiz Sr.",    tel:"6562005011", email:"fruizsr@mail.com",     sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a5b2",  nombre:"Valeria Solis Pedraza",      fechaNac:"2014-04-17", curp:"SOPV140417MJCLSD02", grupo:"5B", tutor:"Carmen Pedraza",       tel:"6562005012", email:"cpedraza@mail.com",    sangre:"A+",  alergias:"Penicilina", activo:true },
  { id:"a5b3",  nombre:"Omar Chávez Reyes",          fechaNac:"2014-11-29", curp:"CHRO141129HJCVRM03", grupo:"5B", tutor:"Lupita Reyes",         tel:"6562005013", email:"lreyes@mail.com",      sangre:"B+",  alergias:"Ninguna",    activo:true },
  { id:"a5b4",  nombre:"Karina Ibáñez Salinas",      fechaNac:"2014-02-08", curp:"IBSK140208MJCBNS04", grupo:"5B", tutor:"Jorge Salinas",        tel:"6562005014", email:"jsalinas@mail.com",    sangre:"AB+", alergias:"Látex",      activo:true },
  { id:"a5b5",  nombre:"Roberto Palomino Ramos",     fechaNac:"2014-06-21", curp:"PARR140621HJCLMS05", grupo:"5B", tutor:"Griselda Ramos",       tel:"6562005015", email:"gramos2@mail.com",     sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a5b6",  nombre:"Natalia Guerrero Peña",      fechaNac:"2014-10-14", curp:"GEPN141014MJCRRR06", grupo:"5B", tutor:"Raúl Guerrero",        tel:"6562005016", email:"rguerrero2@mail.com",  sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a5b7",  nombre:"Erick Montes Díaz",          fechaNac:"2014-03-30", curp:"MODE140330HJCNTS07", grupo:"5B", tutor:"Yolanda Díaz",         tel:"6562005017", email:"ydiaz@mail.com",       sangre:"B-",  alergias:"Polen",      activo:true },
  { id:"a5b8",  nombre:"Sofía Benítez Cruz",         fechaNac:"2014-09-06", curp:"BECS140906MJCNTZ08", grupo:"5B", tutor:"Pedro Benítez",        tel:"6562005018", email:"pbenitez@mail.com",    sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a5b9",  nombre:"Alberto García Ponce",       fechaNac:"2014-07-12", curp:"GAPA140712HJCRPN09", grupo:"5B", tutor:"Elvira Ponce",         tel:"6562005019", email:"eponce@mail.com",      sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a5b10", nombre:"Lorena Méndez Vidal",        fechaNac:"2014-05-25", curp:"MEVL140525MJCNDZ10", grupo:"5B", tutor:"Arturo Vidal",         tel:"6562005020", email:"avidal@mail.com",      sangre:"AB-", alergias:"Mariscos",   activo:true },
  // ── 6A ──
  { id:"a6a1",  nombre:"Lucía Mendoza Vargas",       fechaNac:"2013-05-19", curp:"MEVL130519MJCRCR01", grupo:"6A", tutor:"Rosa Vargas",          tel:"6562006001", email:"rvargas@mail.com",     sangre:"AB-", alergias:"Ninguna",    activo:true },
  { id:"a6a2",  nombre:"Héctor Ramírez Soto",        fechaNac:"2013-02-07", curp:"RASH130207HJCMZT02", grupo:"6A", tutor:"Pilar Soto",           tel:"6562006002", email:"psoto@mail.com",       sangre:"O+",  alergias:"Penicilina", activo:true },
  { id:"a6a3",  nombre:"Montserrat Flores Rueda",    fechaNac:"2013-10-23", curp:"FORM131023MJCLLS03", grupo:"6A", tutor:"Benjamín Rueda",       tel:"6562006003", email:"brueda@mail.com",      sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a6a4",  nombre:"Roberto Cruz Espinoza",      fechaNac:"2013-06-15", curp:"CUER130615HJCRZB04", grupo:"6A", tutor:"Alicia Espinoza",      tel:"6562006004", email:"aespinoza@mail.com",   sangre:"B+",  alergias:"Látex",      activo:true },
  { id:"a6a5",  nombre:"Daniela Salinas Vega",       fechaNac:"2013-01-31", curp:"SAVD130131MJCLNS05", grupo:"6A", tutor:"Carlos Vega",          tel:"6562006005", email:"cvega@mail.com",       sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a6a6",  nombre:"Omar Herrera Ríos",          fechaNac:"2013-08-04", curp:"HERO130804HJCRRS06", grupo:"6A", tutor:"Susana Ríos",          tel:"6562006006", email:"surios@mail.com",      sangre:"A-",  alergias:"Ninguna",    activo:true },
  { id:"a6a7",  nombre:"Estefanía Ortega Lara",      fechaNac:"2013-11-17", curp:"ORLE131117MJCRTF07", grupo:"6A", tutor:"Enrique Ortega",       tel:"6562006007", email:"eortega@mail.com",     sangre:"B-",  alergias:"Polen",      activo:true },
  { id:"a6a8",  nombre:"Cristian Torres Morales",    fechaNac:"2013-04-09", curp:"TOMC130409HJCRRS08", grupo:"6A", tutor:"Lorena Morales",       tel:"6562006008", email:"lmorales@mail.com",    sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a6a9",  nombre:"Priscila Guzmán Acosta",     fechaNac:"2013-07-22", curp:"GUAP130722MJCZMN09", grupo:"6A", tutor:"Daniel Acosta",        tel:"6562006009", email:"dacosta@mail.com",     sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a6a10", nombre:"Rodrigo Leal Castro",        fechaNac:"2013-03-18", curp:"LECR130318HJCLLS10", grupo:"6A", tutor:"Fernanda Castro",      tel:"6562006010", email:"fcastro@mail.com",     sangre:"AB-", alergias:"Mariscos",   activo:true },
  // ── 6B ──
  { id:"a6b1",  nombre:"Alejandro Torres Fuentes",   fechaNac:"2013-11-27", curp:"TOFA131127HJCRRN01", grupo:"6B", tutor:"Alejandro Torres",     tel:"6562006011", email:"atorres@mail.com",     sangre:"B+",  alergias:"Mariscos",   activo:true },
  { id:"a6b2",  nombre:"Paulina Aguilar Medina",     fechaNac:"2013-05-14", curp:"AGMP130514MJCGLD02", grupo:"6B", tutor:"Miguel Aguilar",       tel:"6562006012", email:"maguilar@mail.com",    sangre:"O+",  alergias:"Penicilina", activo:true },
  { id:"a6b3",  nombre:"Sebastián Campos Ruiz",      fechaNac:"2013-09-28", curp:"CARS130928HJCMPS03", grupo:"6B", tutor:"Rocío Ruiz",           tel:"6562006013", email:"rruiz@mail.com",       sangre:"A+",  alergias:"Ninguna",    activo:true },
  { id:"a6b4",  nombre:"Karen Serrano Domínguez",    fechaNac:"2013-03-06", curp:"SEDK130306MJCRRD04", grupo:"6B", tutor:"Ignacio Domínguez",    tel:"6562006014", email:"idominguez@mail.com",  sangre:"B-",  alergias:"Látex",      activo:true },
  { id:"a6b5",  nombre:"Pablo Moreno García",        fechaNac:"2013-08-19", curp:"MOGP130819HJCRRN05", grupo:"6B", tutor:"Elena García",         tel:"6562006015", email:"egarcia@mail.com",     sangre:"AB+", alergias:"Ninguna",    activo:true },
  { id:"a6b6",  nombre:"Génesis Rivera López",       fechaNac:"2013-01-25", curp:"RILG130125MJCVRS06", grupo:"6B", tutor:"Roberto Rivera",       tel:"6562006016", email:"rrivera@mail.com",     sangre:"O-",  alergias:"Ninguna",    activo:true },
  { id:"a6b7",  nombre:"Miguel Ángel Vega Salas",    fechaNac:"2013-07-10", curp:"VESM130710HJCGLS07", grupo:"6B", tutor:"Dora Salas",           tel:"6562006017", email:"dsalas@mail.com",      sangre:"A-",  alergias:"Polen",      activo:true },
  { id:"a6b8",  nombre:"Liliana Ávila Guerrero",     fechaNac:"2013-04-30", curp:"AVGL130430MJCVLR08", grupo:"6B", tutor:"Oscar Ávila",          tel:"6562006018", email:"oavila@mail.com",      sangre:"B+",  alergias:"Ninguna",    activo:true },
  { id:"a6b9",  nombre:"Diego Castillo Peña",        fechaNac:"2013-10-07", curp:"CAPD131007HJCSTL09", grupo:"6B", tutor:"Adriana Peña",         tel:"6562006019", email:"adpena@mail.com",      sangre:"O+",  alergias:"Ninguna",    activo:true },
  { id:"a6b10", nombre:"Miriam Núñez Fuentes",       fechaNac:"2013-06-21", curp:"NUFM130621MJCZMN10", grupo:"6B", tutor:"Víctor Fuentes",       tel:"6562006020", email:"vfuentes@mail.com",    sangre:"AB-", alergias:"Mariscos",   activo:true },
];

/* ── CALIFICACIONES MUESTRA ── */
const SEED_CALIFICACIONES = SEED_ALUMNOS.slice(0,20).map(a=>({
  id: uuid(),
  alumnoId: a.id,
  materia: "Todas las materias",
  tri1: +(6 + Math.random()*4).toFixed(1),
  tri2: +(6 + Math.random()*4).toFixed(1),
  tri3: +(6 + Math.random()*4).toFixed(1),
  ciclo: "2024-2025"
}));

const todayStr = () => new Date().toISOString().slice(0,10);

const SEED_ASISTENCIA = SEED_ALUMNOS.map(a=>({
  id: uuid(),
  alumnoId: a.id,
  fecha: todayStr(),
  estado: Math.random() > 0.15 ? "presente" : "ausente",
  maestroId: SEED_GRUPOS.find(g=>g.id===a.grupo)?.maestroId || "m1"
}));

const SEED_AVISOS = [
  { id:uuid(), tipo:"reunion",        titulo:"Reunión de padres de familia",        desc:"Junta general – Salón de actos. Asistencia obligatoria.",                             fecha:"2025-05-08", grupo:"Todos", autor:"Dirección", activo:true },
  { id:uuid(), tipo:"calificaciones", titulo:"Entrega de boletas del 2° trimestre", desc:"Segundo trimestre – Todos los grupos. Traer boleta del trimestre anterior.",          fecha:"2025-05-15", grupo:"Todos", autor:"Dirección", activo:true },
  { id:uuid(), tipo:"evento",         titulo:"Día del Maestro – Suspensión",        desc:"No habrá clases el 15 de mayo por celebración del Día del Maestro.",                 fecha:"2025-05-15", grupo:"Todos", autor:"Dirección", activo:true },
];

/* ═══════════════════════════════════════════
   HOOK PRINCIPAL
═══════════════════════════════════════════ */
export function useDB() {
  const [alumnos,        setAlumnosState]    = useState(()=>load("edu_alumnos",       SEED_ALUMNOS));
  const [maestros,       setMaestrosState]   = useState(()=>load("edu_maestros",      SEED_MAESTROS));
  const [grupos,         setGruposState]     = useState(()=>load("edu_grupos",        SEED_GRUPOS));
  const [calificaciones, setCalifState]      = useState(()=>load("edu_calificaciones",SEED_CALIFICACIONES));
  const [asistencia,     setAsistenciaState] = useState(()=>load("edu_asistencia",    SEED_ASISTENCIA));
  const [avisos,         setAvisosState]     = useState(()=>load("edu_avisos",        SEED_AVISOS));

  useEffect(()=>{ save("edu_alumnos",       alumnos);        },[alumnos]);
  useEffect(()=>{ save("edu_maestros",      maestros);       },[maestros]);
  useEffect(()=>{ save("edu_grupos",        grupos);         },[grupos]);
  useEffect(()=>{ save("edu_calificaciones",calificaciones); },[calificaciones]);
  useEffect(()=>{ save("edu_asistencia",    asistencia);     },[asistencia]);
  useEffect(()=>{ save("edu_avisos",        avisos);         },[avisos]);

  const agregarAlumno  = useCallback((d)=>{const n={...d,id:uuid(),activo:true};setAlumnosState(p=>[...p,n]);return n;},[]);
  const editarAlumno   = useCallback((id,d)=>setAlumnosState(p=>p.map(a=>a.id===id?{...a,...d}:a)),[]);
  const eliminarAlumno = useCallback((id)=>setAlumnosState(p=>p.map(a=>a.id===id?{...a,activo:false}:a)),[]);

  const agregarMaestro = useCallback((d)=>{const n={...d,id:uuid(),activo:true};setMaestrosState(p=>[...p,n]);return n;},[]);
  const editarMaestro  = useCallback((id,d)=>setMaestrosState(p=>p.map(m=>m.id===id?{...m,...d}:m)),[]);
  const eliminarMaestro= useCallback((id)=>setMaestrosState(p=>p.map(m=>m.id===id?{...m,activo:false}:m)),[]);

  const agregarGrupo = useCallback((d)=>{const n={...d,id:d.id||uuid()};setGruposState(p=>[...p,n]);return n;},[]);
  const editarGrupo  = useCallback((id,d)=>setGruposState(p=>p.map(g=>g.id===id?{...g,...d}:g)),[]);

  const guardarCalificacion  = useCallback((d)=>{
    setCalifState(p=>{
      const ex=p.find(c=>c.alumnoId===d.alumnoId&&c.materia===d.materia&&c.ciclo===d.ciclo);
      if(ex) return p.map(c=>c.id===ex.id?{...c,...d}:c);
      return [...p,{...d,id:uuid()}];
    });
  },[]);
  const eliminarCalificacion = useCallback((id)=>setCalifState(p=>p.filter(c=>c.id!==id)),[]);

  const guardarAsistencia = useCallback((alumnoId,fecha,estado,maestroId)=>{
    setAsistenciaState(p=>{
      const ex=p.find(a=>a.alumnoId===alumnoId&&a.fecha===fecha);
      if(ex) return p.map(a=>a.id===ex.id?{...a,estado,maestroId}:a);
      return [...p,{id:uuid(),alumnoId,fecha,estado,maestroId}];
    });
  },[]);
  const asistenciaPorFecha  = useCallback((f)=>asistencia.filter(a=>a.fecha===f),[asistencia]);
  const asistenciaPorAlumno = useCallback((id)=>asistencia.filter(a=>a.alumnoId===id),[asistencia]);

  const agregarAviso  = useCallback((d)=>{const n={...d,id:uuid(),activo:true};setAvisosState(p=>[...p,n]);return n;},[]);
  const eliminarAviso = useCallback((id)=>setAvisosState(p=>p.map(a=>a.id===id?{...a,activo:false}:a)),[]);

  const promedioAlumno = useCallback((alumnoId)=>{
    const califs=calificaciones.filter(c=>c.alumnoId===alumnoId);
    if(!califs.length) return null;
    const proms=califs.map(c=>((Number(c.tri1)||0)+(Number(c.tri2)||0)+(Number(c.tri3)||0))/3);
    return +(proms.reduce((a,b)=>a+b,0)/proms.length).toFixed(1);
  },[calificaciones]);

  const faltasAlumno        = useCallback((id)=>asistencia.filter(a=>a.alumnoId===id&&a.estado==="ausente").length,[asistencia]);
  const asistenciaPctAlumno = useCallback((id)=>{
    const total=asistencia.filter(a=>a.alumnoId===id).length;
    if(!total) return 100;
    return Math.round((asistencia.filter(a=>a.alumnoId===id&&a.estado!=="ausente").length/total)*100);
  },[asistencia]);

  const nivelRiesgo = useCallback((id)=>{
    const f=faltasAlumno(id),p=promedioAlumno(id),pct=asistenciaPctAlumno(id);
    if(f>=10||p<7||pct<75) return "alto";
    if(f>=6||(p!==null&&p<7.5)||pct<85) return "medio";
    return "bajo";
  },[faltasAlumno,promedioAlumno,asistenciaPctAlumno]);

  // Buscar maestro por usuario y contraseña
  const loginMaestro = useCallback((usuario,pass)=>{
    return maestros.find(m=>m.usuario===usuario&&m.pass===pass&&m.activo!==false)||null;
  },[maestros]);

  return {
    alumnos:      alumnos.filter(a=>a.activo),
    maestros:     maestros.filter(m=>m.activo!==false),
    grupos,
    calificaciones,
    asistencia,
    avisos:       avisos.filter(a=>a.activo),
    agregarAlumno, editarAlumno, eliminarAlumno,
    agregarMaestro, editarMaestro, eliminarMaestro,
    agregarGrupo, editarGrupo,
    guardarCalificacion, eliminarCalificacion,
    guardarAsistencia, asistenciaPorFecha, asistenciaPorAlumno,
    agregarAviso, eliminarAviso,
    promedioAlumno, faltasAlumno, asistenciaPctAlumno, nivelRiesgo,
    loginMaestro,
  };
}
