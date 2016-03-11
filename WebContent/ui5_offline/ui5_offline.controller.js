sap.ui.controller("ui5_offline.ui5_offline", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf ui5_offline.ui5_offline
     */
    onInit: function() {

        this.prepareIDB();

     },

    writeIDB: function(objectDB, data) {

        //Create a transaction
        var oTransaction = myDB.transaction([objectDB], "readwrite"); //add atribute read and write in to DB

        //Get the requires object store for this transaction
        var oDataStore = oTransaction.objectStore(objectDB);

        // Add data
        for (var index in data) {
            oDataStore.add(data[index]);
        }

        myDB.onerror = function(event) {

            console.log("Database error: " + event.target.errorCode);
        };
    },

    readIDB: function() {

        var objectStore = myDB.transaction(["COMMENTS"]).objectStore("COMMENTS");

        var request = objectStore.get(1); //Key 1

        request.onsuccess = function(oEvent) {

            console.log("Read Success");
            console.log(request.result);
        };

        request.onerror = function(oEvent) {

            console.log("Error in Read");
        };
    },

    updateIDB: function() {

        var objectStore = myDB.transaction(["COMMENTS"], "readwrite").objectStore("COMMENTS");
        var request = objectStore.get(1); //Key 1

        request.onsuccess = function(oEvent) {

            var data = request.result;

            data.ECODE = "CHANGE_ECODE"; //Change value ECODE by ID

            var requestUpdate = objectStore.put(data);

            requestUpdate.onerror = function(oEvent) {
                console.log("Error Update");
            };

            requestUpdate.onsuccess = function(oEvent) {
                console.log("Update Success");
            };

        };

        request.onerror = function(oEvent) {

            console.log("Error in Request");
        };
    },

    deleteIDB: function() {

        var objectStore = myDB.transaction(["COMMENTS"], "readwrite").objectStore("COMMENTS");
       // var request = objectStore.delete(1); //Key 1

        request.onsuccess = function(oEvent) {
            console.log("Delete Success")
        };
        request.onerror = function(oEvent) {
            console.error("Error deleteing: ", e);
        };

    },

    cursorIDB: function() {

        var objectStore = myDB.transaction(["SINTOMAS"]).objectStore("SINTOMAS");

        objectStore.openCursor().onsuccess = function(oEvent) {
            //objectStore.openCursor(null, "prev").onsuccess --  order descending	
            var cursor = oEvent.target.result;

            if (cursor) {

                //	console.log(cursor.key);
                //	console.log(cursor);
                //console.log(cursor.value[count]);
                cursor.continue();
            } else {
                console.log("Data is empty");
            }

        };

        objectStore.openCursor().onerror = function(oEvent) {

            console.log("Error Cursor");
        };

    },
    
    getDateTimeToday : function(){
    	
    	var dateTime = new Date();
        var stringDateTime = "";

        dateTime.getDate() < 10 ? stringDateTime += "0" + dateTime.getDate() + "/" : stringDateTime += dateTime.getDate() + "/";
        dateTime.getDay() < 10 ? stringDateTime += "0" + (dateTime.getMonth() + 1) + "/" : stringDateTime += (dateTime.getMonth() + 1) + "/";
        stringDateTime += dateTime.getFullYear() + " ";

        dateTime.getHours() < 10 ? stringDateTime += "0" + dateTime.getHours() + ":" : stringDateTime += dateTime.getHours() + ":";
        dateTime.getMinutes() < 10 ? stringDateTime += "0" + dateTime.getMinutes() + ":" : stringDateTime += dateTime.getMinutes() + ":";
        dateTime.getSeconds() < 10 ? stringDateTime += "0" + dateTime.getSeconds() : stringDateTime += dateTime.getSeconds();
        
        return stringDateTime;
    },
    
    deletePaciente: function(_IDPaciente) {

        var objectStore = myDB.transaction(["PACIENTE"], "readwrite").objectStore("PACIENTE");
        
        var request = objectStore.delete(_IDPaciente); //Key 1

        request.onsuccess = function(oEvent) {
       	
        	var objectStore = myDB.transaction(["CATEGORIZADO"]).objectStore("CATEGORIZADO").index("ID_PACIENTE");
            
        	 objectStore.openCursor(IDBKeyRange.only(_IDPaciente)).onsuccess = function(oEvent) {
        		 
        		 var objectStore_ = myDB.transaction(["CATEGORIZADO"], "readwrite").objectStore("CATEGORIZADO");
        		 
        		 var cursor = oEvent.target.result;
        		 
        		 if(cursor){
        			
        			 var request_ = objectStore_.delete(_IDPaciente); 
        			 
        			 cursor.continue(); 
        		 }
        		 	 
        	 };

        };
        request.onerror = function(oEvent) {
            console.error("Error deleteing: ", e);
        };

    },

    getData_pacientesNoCategorizados: function() {

        var cursorData = [];

        var objectStore = myDB.transaction(["PACIENTE"]).objectStore("PACIENTE").index("CATEGORIZADO");
        objectStore.openCursor(IDBKeyRange.only("No")).onsuccess = function(oEvent) {

            var cursor = oEvent.target.result;

            if (cursor) {

                cursorData.push({
                    ID: cursor.value.ID,
                    NOMBRES: cursor.value.NOMBRES,
                    APELLIDOS: cursor.value.PRIMER_APELLIDO+" "+cursor.value.SEGUNDO_APELLIDO,
                    TIPO_DOCUMENTO: cursor.value.TIPO_DOCUMENTO,
                    DOCUMENTO: cursor.value.DOCUMENTO,
                    SEXO: cursor.value.SEXO,
                    FECHA_NACIMIENTO: cursor.value.FECHA_NACIMIENTO,
                    MOTIVO: cursor.value.MOTIVO,
                    TIPO_ATENCION: cursor.value.TIPO_ATENCION,
                    FECHA_HORA_INGRESO: cursor.value.FECHA_HORA_INGRESO,
                    EDAD: SAP_UI.calculateAge(cursor.value.FECHA_NACIMIENTO.split("/")[2] + "/" +
                        cursor.value.FECHA_NACIMIENTO.split("/")[1] + "/" +
                        cursor.value.FECHA_NACIMIENTO.split("/")[0])
                })

                cursor.continue();

            } else {

                sap.ui.getCore().byId("oTable_pacientesNoCategorizados")
                    .setModel(new sap.ui.model.json.JSONModel(cursorData))
                    .bindItems("/", new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({
                                text: "{FECHA_HORA_INGRESO}"
                            }),
                            new sap.m.Text({
                                text: "{NOMBRES}"
                            }),
                            new sap.m.Text({
                                text: "{APELLIDOS}"
                            }),
                            new sap.m.Text({
                                text: "{EDAD}"
                            }),
                            new sap.m.Text({
                                text: "{SEXO}"
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://activity-individual",
                                size: "25px",
                                activeColor: "white",
                                activeBackgroundColor: "#333333",
                                hoverColor: "#eeeeee",
                                hoverBackgroundColor: "#666666",
                                press : function(oEvent) {
                                    console.log(this);
                                    var oData = sap.ui.getCore().byId("oTable_pacientesNoCategorizados").getModel().oData;
                                    SAP_UI.createDetailPage_SINTOMAS(oData[this.getId().split("-")[2]]);
                                }
                            }).addStyleClass("iconCategorizarPaciente")
                        ]
                    }));
            }
        };


    },

    getData_pacientesCategorizados: function() {

        var cursorData = [];
        
        var objectStore = myDB.transaction(["PACIENTE"]).objectStore("PACIENTE").index("PRIORIDAD");
        
        var lowerBound = ["1",'Si','01/01/1900 00:00:00'];
        var upperBound = ["5",'Si', SAP_UI.getDateTimeToday()];
        
        
        objectStore.openCursor(IDBKeyRange.bound(lowerBound,upperBound),"next").onsuccess = function(oEvent) {
        	
        	var cursor = oEvent.target.result;

            if (cursor) {   

            	var objectStore = myDB.transaction(["CLASIFICACION_TRIAJE"]).objectStore("CLASIFICACION_TRIAJE");

                var request = objectStore.get(String(cursor.value.NIVEL_URGENCIA));

                request.onsuccess = function(oEvent) {

                    var data = request.result;
             		console.log(data.value);
	                cursorData.push({
	                    ID: cursor.value.ID,
	                    NOMBRES: cursor.value.NOMBRES,
	                    PRIMER_APELLIDO: cursor.value.PRIMER_APELLIDO,
	                    SEGUNDO_APELLIDO: cursor.value.SEGUNDO_APELLIDO,
	                    APELLIDOS : cursor.value.PRIMER_APELLIDO+" "+cursor.value.SEGUNDO_APELLIDO,
	                    TIPO_DOCUMENTO: cursor.value.TIPO_DOCUMENTO,
	                    DOCUMENTO: cursor.value.DOCUMENTO,
	                    SEXO: cursor.value.SEXO,
	                    FECHA_NACIMIENTO: cursor.value.FECHA_NACIMIENTO,
	                    MOTIVO: cursor.value.MOTIVO,
	                    TIPO_ATENCION: cursor.value.TIPO_ATENCION,
	                    FECHA_HORA_INGRESO: cursor.value.FECHA_HORA_INGRESO,
	                    EDAD: SAP_UI.calculateAge(cursor.value.FECHA_NACIMIENTO.split("/")[2] + "/" +
	                        cursor.value.FECHA_NACIMIENTO.split("/")[1] + "/" +
	                        cursor.value.FECHA_NACIMIENTO.split("/")[0]),
	                    NIVEL_URGENCIA: cursor.value.NIVEL_URGENCIA,
	                    FECHA_HORA_CATEGORIZACION: cursor.value.FECHA_HORA_CATEGORIZACION,
	                    COLOR : data.COLOR,	
	                    CSS_COLOR : data.CSS_COLOR,
	                    SINTOMA : cursor.value.SINTOMA,
	                    PREVISION : cursor.value.PREVISION,
	                    MEDIO_TRANSPORTE : cursor.value.MEDIO_TRANSPORTE,
	                    CANT_CATEGORIZADO : cursor.value.CANT_CATEGORIZADO > 1 ? true : false
	                })
               };
               
               
                cursor.continue();

            } else {

                sap.ui.getCore().byId("oTable_pacientesCategorizados")
                    .setModel(new sap.ui.model.json.JSONModel(cursorData))
                    .bindItems("/", new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({
                                text: "{FECHA_HORA_CATEGORIZACION}"
                            }),
                            new sap.m.Text({
                                text: "{NOMBRES}"
                            }),
                            new sap.m.Text({
                                text: "{APELLIDOS}"
                            }),
                            new sap.m.Text({
                                text: "{EDAD}"
                            }),
                            new sap.m.Text({
                                text: "{SEXO}"
                            }),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Text({
                                        text: "{COLOR}"
                                    }),
                                    new sap.ui.core.Icon({
                                        src: "sap-icon://overlay",
                                        size: "17px",
                                        color: "{CSS_COLOR}",
                                        activeColor: "white",
                                        activeBackgroundColor: "#333333",
                                        hoverColor: "#eeeeee",
                                        hoverBackgroundColor: "#666666",
                                        width: "60px",
                                    })
                                ]
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://display",
                                size: "25px",
                                activeColor: "white",
                                visible : "{CANT_CATEGORIZADO}",
                                activeBackgroundColor: "#333333",
                                hoverColor: "#eeeeee",
                                hoverBackgroundColor: "#666666",
                                press : function(){
                                	var cursorData = [];

                                    var objectStore = myDB.transaction(["CATEGORIZADO"]).objectStore("CATEGORIZADO").index("ID_PACIENTE");
                                    objectStore.openCursor(IDBKeyRange.only(this.getModel().oData[this.getId().split("-")[2]].ID), "prev").onsuccess = function(oEvent) {

                                        var cursor = oEvent.target.result;

                                        if (cursor) {

                                            cursorData.push({                                          	
                                                ID: cursor.value.ID,
                                                ID_PACIENTE: cursor.value.ID_PACIENTE,
                                                COLOR: cursor.value.COLOR,
                                                CSS_COLOR : cursor.value.CSS_COLOR,
                                                FECHA_HORA: cursor.value.FECHA_HORA,
                                                SINTOMA: cursor.value.SINTOMA
                                            })

                                            cursor.continue();

                                        } else {
                                        	
                                        	var oTable =  new sap.m.Table("oTableCategorizacionHistorica",{
                                                mode: sap.m.ListMode.SingleSelectMaster,
                                                columns: [
                                                    new sap.m.Column({
                                                        minScreenWidth : "500px",
                                                        demandPopin :  true,
                                                        header: new sap.m.HBox({
                                                            items: [new sap.m.Label({
		                                                            	text: "Fecha y Hora",
		                                                            	design : sap.m.LabelDesign.Bold	
		                                                        	}),
                                                                new sap.ui.core.Icon({
                                                                    src: "sap-icon://past",
                                                                    width: "35px"
                                                                })
                                                            ]
                                                        })
                                                    
                                                    }),
                                                    new sap.m.Column({
                                                    	 minScreenWidth : "800px",
                                                         demandPopin :  true,
                                                        header: new sap.m.Label({
                                                            text: "Discriminador",
                                                            design : sap.m.LabelDesign.Bold
                                                        })
                                                    }),
                                                    new sap.m.Column({
                                                    	 minScreenWidth : "1100px",
                                                         demandPopin :  true,
                                                        header: new sap.m.Label({
                                                            text: "Categoria",
                                                            design : sap.m.LabelDesign.Bold
                                                        })
                                                    })
                                                  ]
                                        	}).setModel(new sap.ui.model.json.JSONModel(cursorData))
                                        	.bindItems("/", new sap.m.ColumnListItem({
                                                cells: [new sap.m.HBox({
                                                            items: [
                                                                new sap.m.Text({
		                                                            text: "{FECHA_HORA}"
		                                                        }),
                                                                new sap.ui.core.Icon({
                                                                    src: "sap-icon://down",
                                                                    width: "35px",
                                                                    size : "10px"
                                                                })
                                                            ]
                                                        }),
                                                        new sap.m.Text({
                                                            text: "{SINTOMA}"
                                                        }),
                                                        new sap.m.HBox({
                                                            items: [
                                                                new sap.m.Text({
                                                                    text: "{COLOR}"
                                                                }),
                                                                new sap.ui.core.Icon({
                                                                    src: "sap-icon://overlay",
                                                                    size: "17px",
                                                                    color: "{CSS_COLOR}",
                                                                    activeColor: "white",
                                                                    activeBackgroundColor: "#333333",
                                                                    hoverColor: "#eeeeee",
                                                                    hoverBackgroundColor: "#666666",
                                                                    width: "60px",
                                                                })
                                                            ]
                                                        })
                                                      ] 
                                        		}))
                                        	
		                                	var dialog =  new sap.m.Dialog({
		                        				title: 'Categorizacion Historica',
		                        				resizable: true,
		                        				content:[oTable],
		                        				beginButton: new sap.m.Button({
		                        					text: 'Salir',
		                        					press: function () {
		                        						dialog.close();
		                        					}
		                        				}),
		                        				afterClose: function() {
		                        					dialog.destroy();
		                        				}
		                        			}).open();
                                    }     	
                                };
                              }
                            }).addStyleClass("iconCategorizacionHistoricaPaciente"),     
                            new sap.ui.core.Icon({
                                src: "sap-icon://activity-individual",
                                size: "25px",
                                activeColor: "white",
                                activeBackgroundColor: "#333333",
                                hoverColor: "#eeeeee",
                                hoverBackgroundColor: "#666666",
                                press : function(oEvent) {
                                    var oData = sap.ui.getCore().byId("oTable_pacientesCategorizados").getModel().oData;
                                    SAP_UI.createDetailPage_SINTOMAS(oData[this.getId().split("-")[2]]);
                                }
                            }).addStyleClass("iconCategorizarPaciente"),
                            
                            new sap.ui.core.Icon({
                                src: "sap-icon://visits",
                                size: "25px",
                                activeColor: "white",
                                activeBackgroundColor: "#333333",
                                hoverColor: "#eeeeee",
                                hoverBackgroundColor: "#666666",
                                press : function(oEvent) {
                                	
                                	var dialog =  new sap.m.Dialog({
                        				title: 'Atencion',
                        				resizable: true,
                        				draggable :true,
                        				stretchOnPhone : true,
                        				content:[new sap.ui.layout.form.SimpleForm("oFormDerivarPaciente", {
            	                            maxContainerCols: 2,
            	                            editable: true,
            	                            content: [new sap.ui.core.Title({
            	                                    text: "Derivar Paciente"
            	                                }),
            	                                new sap.ui.commons.Label({
                                                    text: "Describe Atencion:"
                                                }),
            	                                new sap.ui.commons.DropdownBox("oDropdownDerivarPaciente", {
            	                                	
                                                }).setModel(
                                                    new sap.ui.model.json.JSONModel([{
                                                        text: "Atendido",
                                                        key: "1"
                                                    }, {
                                                        text: "No se presenta",
                                                        key: "2"
                                                    }, {
                                                        text: "Se retira bajo su responsabilidad",
                                                        key: "3"
                                                    }])
                                                ).bindItems("/", new sap.ui.core.ListItem().bindProperty("text", "text").bindProperty("key", "key")),    
                                            new sap.ui.commons.Label({
                                                text: "Observaciones:"
                                            }),
                                            new sap.ui.commons.TextArea("observacionDerivarPaciente",{})
                        				  
                                           ]
                        				})],
                        				beginButton: new sap.m.Button({
                        					text: 'Confirmar',
                        					press: function () {
                        						
                        						var data = sap.ui.getCore().byId("oTable_pacientesCategorizados").getModel().oData[0];
                        						console.log(data);
                        						
                                                SAP_UI.writeIDB("PACIENTE_DERIVADO", [{
                                                    NOMBRES: data.NOMBRES,
                                                    PRIMER_APELLIDO : data.PRIMER_APELLIDO,
                                                    SEGUNDO_APELLIDO : data.SEGUNDO_APELLIDO,
                                                    TIPO_DOCUMENTO: data.TIPO_DOCUMENTO,
                                                    DOCUMENTO: data.TIPO_DOCUMENTO,
                                                    SEXO: data.SEXO,
                                                    EDAD: data.SEXO,
                                                    FECHA_NACIMIENTO: data.FECHA_NACIMIENTO,
                                                    FECHA_HORA_INGRESO: data.FECHA_HORA_INGRESO,   
                                                    FECHA_HORA_DERIVACION: SAP_UI.getDateTimeToday(),
                                                    MOTIVO: data.MOTIVO,
                                                    TIPO_ATENCION: data.TIPO_ATENCION,                                                                         
                                                    PREVISION: data.PREVISION,
                                                    MEDIO_TRANSPORTE: data.MEDIO_TRANSPORTE,
                                                    CATEGORIZADO: data.CATEGORIZADO,
                                                    SINTOMA :data.SINTOMA,
                                                    OBSERVACION :sap.ui.getCore().byId("observacionDerivarPaciente").getValue(),
                                                    DERIVACION : sap.ui.getCore().byId("oDropdownDerivarPaciente").getValue(),
                                                    NIVEL_URGENCIA : data.NIVEL_URGENCIA,
                                                }]);
                                                
                                                SAP_UI.deletePaciente(data.ID);
                                                SAP_UI.getData_pacientesCategorizados();
                        						dialog.close();
                        					}
                        				}),
                        				endButton: new sap.m.Button({
                        					text: 'Cancelar',
                        					press: function () {
                        						dialog.close();
                        					}
                        				}),
                        				afterClose: function() {
                        					dialog.destroy();
                        				}
                        			}).open();
                                }
                            }).addStyleClass("iconDerivarPaciente")
                        ]
                    }));
            }
        };


    },
    
    getData_pacientesDerivados : function(key){

        var cursorData = [];
        
        var objectStore = myDB.transaction(["PACIENTE_DERIVADO"]).objectStore("PACIENTE_DERIVADO").index("DERIVACION");
        
       objectStore.openCursor(IDBKeyRange.only(key),"prev").onsuccess = function(oEvent) {
        	
        	var cursor = oEvent.target.result;

            if (cursor) {   
            	       	
	                cursorData.push({
	                    ID: cursor.value.ID,
	                    NOMBRES: cursor.value.NOMBRES,
	                    APELLIDOS : cursor.value.PRIMER_APELLIDO+" "+cursor.value.SEGUNDO_APELLIDO,
	                    TIPO_DOCUMENTO: cursor.value.TIPO_DOCUMENTO,
	                    DOCUMENTO: cursor.value.DOCUMENTO,
	                    SEXO: cursor.value.SEXO,
	                    FECHA_NACIMIENTO: cursor.value.FECHA_NACIMIENTO,
	                    MOTIVO: cursor.value.MOTIVO,
	                    TIPO_ATENCION: cursor.value.TIPO_ATENCION,
	                    FECHA_HORA_INGRESO: cursor.value.FECHA_HORA_INGRESO,
	                    EDAD: cursor.value.EDAD,
	                    NIVEL_URGENCIA: cursor.value.NIVEL_URGENCIA,
	                    FECHA_HORA_CATEGORIZACION: cursor.value.FECHA_HORA_CATEGORIZACION,
	                    COLOR : cursor.value.COLOR,	
	                    CSS_COLOR : cursor.value.CSS_COLOR,
	                    SINTOMA : cursor.value.SINTOMA,
	                    PREVISION : cursor.value.PREVISION,
	                    MEDIO_TRANSPORTE : cursor.value.MEDIO_TRANSPORTE,
	                    CANT_CATEGORIZADO : cursor.value.CANT_CATEGORIZADO,
	                    FECHA_HORA_DERIVACION : cursor.value.FECHA_HORA_DERIVACION
	                })
               
                cursor.continue();

            } else {
            	
                sap.ui.getCore().byId("oTable_pacientesAtendidos")
                    .setModel(new sap.ui.model.json.JSONModel(cursorData))
                    .bindItems("/", new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({
                                text: "{FECHA_HORA_DERIVACION}"
                            }),
                            new sap.m.Text({
                                text: "{NOMBRES}"
                            }),
                            new sap.m.Text({
                                text: "{APELLIDOS}"
                            }),
                            new sap.m.Text({
                                text: "{EDAD}"
                            }),
                            new sap.m.Text({
                                text: "{SEXO}"
                            }),
                            new sap.m.Text({
                                text: "{SINTOMA}"
                            })
                        ]
                    }));
            }
        };
	
    },

    updateData_pacientes: function(updateDataPaciente, dataUrgencia, sintoma) {

        var objectStore = myDB.transaction(["PACIENTE"], "readwrite").objectStore("PACIENTE");

        var request = objectStore.get(updateDataPaciente.ID);

        request.onsuccess = function(oEvent) {

            var data = request.result;

            // update the value(s) in the object that you want to change
            data.CATEGORIZADO = "Si";
            data.CANT_CATEGORIZADO+=1;
            data.NIVEL_URGENCIA = dataUrgencia.NIVEL_URGENCIA;
            data.FECHA_HORA_CATEGORIZACION = SAP_UI.getDateTimeToday();
            data.SINTOMA = sintoma;
            
            // Put this updated object back into the database.
            objectStore.put(data).onerror = function(event) {
                // Do something with the error
            };
            objectStore.put(data).onsuccess = function(event) {
            	SAP_UI.writeIDB("CATEGORIZADO",[{ID_PACIENTE : updateDataPaciente.ID, 
            									FECHA_HORA : SAP_UI.getDateTimeToday(), 
            									SINTOMA : sintoma, 
            									COLOR : dataUrgencia.COLOR,
            									CSS_COLOR : dataUrgencia.CSS_COLOR}]);		
                SAP_UI.createDetailPage_PACIENTES("oPacientePage", "listarPacientesCategorizados");
                SAP_UI.getData_pacientesCategorizados();
            };


        }

    },

    calculateAge: function(fromdate, todate) {

        if (todate) todate = new Date(todate);
        else todate = new Date();

        var age = [],
            fromdate = new Date(fromdate),
            y = [todate.getFullYear(), fromdate.getFullYear()],
            ydiff = y[0] - y[1],
            m = [todate.getMonth(), fromdate.getMonth()],
            mdiff = m[0] - m[1],
            d = [todate.getDate(), fromdate.getDate()],
            ddiff = d[0] - d[1];

        if (mdiff < 0 || (mdiff === 0 && ddiff < 0)) --ydiff;
        if (mdiff < 0) mdiff += 12;
        if (ddiff < 0) {
            fromdate.setMonth(m[1] + 1, 0);
            ddiff = fromdate.getDate() - d[1] + d[0];
            --mdiff;
        }
        if (ydiff > 0) age.push(ydiff + ' a\u00F1o' + (ydiff > 1 ? 's ' : ' '));
        if (mdiff > 0) age.push(mdiff + ' mes' + (mdiff > 1 ? 'es' : ''));
        if (ddiff > 0) age.push(ddiff + ' dia' + (ddiff > 1 ? 's' : ''));
        if (age.length > 1) age.splice(age.length - 1, 0, ' y ');

        return age.join('');
    },

    
    /*******************************************************************************************************************************/
            
    
    //LIMPIA EL FORMULARIO
	vaciar: function(){
		sap.ui.getCore().byId("nombres").setValue("");
		sap.ui.getCore().byId("primerApellido").setValue("");
		sap.ui.getCore().byId("segundoApellido").setValue("");
		sap.ui.getCore().byId("fecha_nacimiento").setValue("");
		sap.ui.getCore().byId("edad").setValue("");
		sap.ui.getCore().byId("motivoConsulta").setValue("");
		sap.ui.getCore().byId("oDropdownTipoDeAtencion").setSelectedKey(1);
		sap.ui.getCore().byId("oDropdownTipoPrevision").setSelectedKey(1);
		sap.ui.getCore().byId("oDropdownMedioTransporte").setSelectedKey(1);
	},
	
	//VALIDA SOLO EN CASO QUE EL TIPO DE DOCUMENTO SEA "CARNET DE IDENTIDAD"
	validarRut: function(){
	
		if(sap.ui.getCore().byId("oDropdownDocumentos").getSelectedKey()==="1"){
    		var valueState = sap.ui.getCore().byId("documento");    
    		$('#documento').Rut({
    			  on_error: function(){
    				  //valueState.setValueState("Error");
    				  alert("Rut inválido");
    				  console.log("rut1 / -error-");
    			  },
    			  on_success: function(){ 
    				  //valueState.setValueState("Success");
    				  alert("Rut válido");
    				  console.log("rut1 / -success");
    			   },
    			  format_on: 'keyup'
   			});
    	}
	},
	
	
	/*******************************************************************************************************************************/
	
    createDetailPage_PACIENTES: function(namePage, sectionPage) {

        for (var index = oSplitApp.getDetailPages().length - 1; index > 0; index--) {
            oSplitApp.getDetailPages()[index].destroy();
        }

        var footerPage = new sap.m.Toolbar({
            active: true,
            content: [new sap.m.ToolbarSpacer({}),
                new sap.m.Button({
                    text: "Registrar",
                    type: "Accept",
                    press: function(oEvent) {

                        if (sap.ui.getCore().byId("nombres").getValue() == "" ||
                        	sap.ui.getCore().byId("primerApellido").getValue() == "" ||
                        	sap.ui.getCore().byId("segundoApellido").getValue() == "" ||
                            sap.ui.getCore().byId("oDropdownDocumentos").getValue() == "" ||
                            sap.ui.getCore().byId("documento").getValue() == "" ||
                            sap.ui.getCore().byId("fecha_nacimiento").getValue() == "" ||
                            !sap.ui.getCore().byId("oRadioButtonSexo").getSelectedItem() ||
                            sap.ui.getCore().byId("oDropdownTipoDeAtencion").getValue() == "" ||
                            sap.ui.getCore().byId("motivoConsulta").getValue() == "" ||
                            sap.ui.getCore().byId("oDropdownTipoPrevision").getValue() == "" ||
                            sap.ui.getCore().byId("oDropdownMedioTransporte").getValue() == "" ) {

                            jQuery.sap.require("sap.m.MessageBox");
                            sap.m.MessageBox.error("Pare ingresar a un paciente, se deben completar todos los campos del registro.", {
                                //icon: sap.m.MessageBox.alert,
                                title: "Error",
                                //actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                                onClose: function(oAction) {
                                    if (oAction === sap.m.MessageBox.Action.YES) {}

                                }
                            });
                        } else {
                        	
                            SAP_UI.writeIDB("PACIENTE", [{
                                NOMBRES: sap.ui.getCore().byId("nombres").getValue(),
                                PRIMER_APELLIDO : sap.ui.getCore().byId("primerApellido").getValue(),
                                SEGUNDO_APELLIDO : sap.ui.getCore().byId("segundoApellido").getValue(),
                                APELLIDOS: sap.ui.getCore().byId("primerApellido").getValue()+" "+sap.ui.getCore().byId("segundoApellido").getValue(),
                                TIPO_DOCUMENTO: sap.ui.getCore().byId("oDropdownDocumentos").getValue(),
                                DOCUMENTO: sap.ui.getCore().byId("documento").getValue(),
                                SEXO: sap.ui.getCore().byId("oRadioButtonSexo").getSelectedItem().getKey(),
                                FECHA_NACIMIENTO: sap.ui.getCore().byId("fecha_nacimiento").getValue(),
                                MOTIVO: sap.ui.getCore().byId("motivoConsulta").getValue(),
                                TIPO_ATENCION: sap.ui.getCore().byId("oDropdownTipoDeAtencion").getValue(),
                                FECHA_HORA_INGRESO: SAP_UI.getDateTimeToday(),                          
                                PREVISION: sap.ui.getCore().byId("oDropdownTipoPrevision").getValue(),
                                MEDIO_TRANSPORTE: sap.ui.getCore().byId("oDropdownMedioTransporte").getValue(),
                                CATEGORIZADO: "No",
                                CANT_CATEGORIZADO : 0
                            }]);
                            
                            sap.ui.getCore().byId("nombres").setValue("");
                            sap.ui.getCore().byId("primerApellido").setValue("");
                            sap.ui.getCore().byId("segundoApellido").setValue("");
                            sap.ui.getCore().byId("documento").setValue("");
                            sap.ui.getCore().byId("fecha_nacimiento").setValue("");
                            sap.ui.getCore().byId("motivoConsulta").setValue("");
                            
                            
                            jQuery.sap.require("sap.m.MessageBox");
                            sap.m.MessageBox.success("El Paciente ha sido registrado con Exito", {
                                title: "Confirmacion",
                            });

                            SAP_UI.getData_pacientesNoCategorizados();
                            sap.ui.getCore().byId("oPacientePage").setFooter(new sap.m.Toolbar({}));
                            sap.ui.getCore().byId("mantenedorPaciente").setSelectedKey("listarPacientesNoCategorizados");
                        }

                    }
                })
            ]
        });

        var oPageDetail = new sap.m.Page("oPacientePage", {
            backgroundDesign: sap.m.PageBackgroundDesign.List,
            title: "Pacientes",
            content: [new sap.m.IconTabBar("mantenedorPaciente", {
                select: function(oEvent) {

                    switch (this.getSelectedKey()) {
                    
	                    case "registroPaciente":
	                        SAP_UI.getData_pacientesCategorizados();
	                        oPageDetail.setFooter(footerPage);
	                    break;
                        case "listarPacientesNoCategorizados":
                            SAP_UI.getData_pacientesNoCategorizados();
                            oPageDetail.setFooter(new sap.m.Toolbar({}));
                            break;
                        case "listarPacientesCategorizados":
                            SAP_UI.getData_pacientesCategorizados();
                            oPageDetail.setFooter(new sap.m.Toolbar({}));
                        break;
                        case "listarPacientesAtendidos":
                            SAP_UI.getData_pacientesDerivados("Atendido");
                            oPageDetail.setFooter(new sap.m.Toolbar({}));
                        break;       
                        
                    }

                },
                items: [new sap.m.IconTabFilter("registroPaciente", {
                    text: "Registrar",
                    icon: "sap-icon://add-contact",
                    content: [new sap.ui.layout.form.SimpleForm("registarPaciente", {
                            maxContainerCols: 2,
                            editable: true,
                            content: [new sap.ui.core.Title({
                                    text: "Ingreso Paciente"
                                }),

                                new sap.ui.commons.Label({
                                    text: "Primer Apellido"
                                }),
                                new sap.ui.commons.TextField("primerApellido", {}).attachBrowserEvent("keypress",function(e){
									if ((event.keyCode != 32) && (event.keyCode < 65) || (event.keyCode > 90) && (event.keyCode < 97) || (event.keyCode > 122)) {  
							          e.preventDefault();  
							        }        
								}),
                                
                                new sap.ui.commons.Label({
                                    text: "Segundo Apellido"
                                }),
                                new sap.ui.commons.TextField("segundoApellido", {}).attachBrowserEvent("keypress",function(e){
									if ((event.keyCode != 32) && (event.keyCode < 65) || (event.keyCode > 90) && (event.keyCode < 97) || (event.keyCode > 122)) {  
							          e.preventDefault();  
							        }        
								}),
                                
                                new sap.ui.commons.Label({
                                    text: "Nombres"
                                }),
                                new sap.ui.commons.TextField("nombres", {}).attachBrowserEvent("keypress",function(e){
									if ((event.keyCode != 32) && (event.keyCode < 65) || (event.keyCode > 90) && (event.keyCode < 97) || (event.keyCode > 122)) {  
							          e.preventDefault();  
							        }        
								}).addStyleClass("nombreField"),

                                new sap.ui.commons.Label({
                                    text: "Documentos"
                                }),
                                new sap.ui.commons.DropdownBox("oDropdownDocumentos", {
                                	
                                	change: function(oEvent){
                                		//sap.ui.getCore().byId("documento").setValue("");
                                		//sap.ui.getCore().byId("documento").setValueState("None");
                                		
                                		if(sap.ui.getCore().byId("oDropdownDocumentos").getSelectedKey()==="1" || sap.ui.getCore().byId("oDropdownDocumentos").getSelectedKey()==="2" || sap.ui.getCore().byId("oDropdownDocumentos").getSelectedKey()==="5"){ //indocumentado
											sap.ui.getCore().byId("nombres").setEnabled(true);
											sap.ui.getCore().byId("primerApellido").setEnabled(true);
											sap.ui.getCore().byId("segundoApellido").setEnabled(true);
											sap.ui.getCore().byId("fecha_nacimiento").setEnabled(true);
											sap.ui.getCore().byId("motivoConsulta").setEnabled(true);
											sap.ui.getCore().byId("documento").setValue("");
											sap.ui.getCore().byId("documento").setEnabled(true);
											sap.ui.getCore().byId("edad").setEditable(false);
											
										}
                                		
                                		if(sap.ui.getCore().byId("oDropdownDocumentos").getSelectedKey()==="3" ){ //inconciente
                                			if(sap.ui.getCore().byId("nombres") !== "" || sap.ui.getCore().byId("primerApellido") !== "" || sap.ui.getCore().byId("segundoApellido") !== "" || sap.ui.getCore().byId("motivoConsulta") !== "" || sap.ui.getCore().byId("documento") !== ""){
                                				SAP_UI.vaciar();
                                			}
											sap.ui.getCore().byId("nombres").setEnabled(false);
											sap.ui.getCore().byId("primerApellido").setEnabled(false);
											sap.ui.getCore().byId("segundoApellido").setEnabled(false);
											sap.ui.getCore().byId("documento").setEnabled(false);
											sap.ui.getCore().byId("fecha_nacimiento").setEnabled(false);
											sap.ui.getCore().byId("edad").setEditable(true);
										}
                                		
                                		if(sap.ui.getCore().byId("oDropdownDocumentos").getSelectedKey()==="4" ){ //indocumentado
                                			if(sap.ui.getCore().byId("nombres") !== "" || sap.ui.getCore().byId("primerApellido") !== "" || sap.ui.getCore().byId("segundoApellido") !== "" || sap.ui.getCore().byId("motivoConsulta") !== "" || sap.ui.getCore().byId("documento") !== ""){
                                				SAP_UI.vaciar();
                                			}
											sap.ui.getCore().byId("nombres").setEnabled(true);
											sap.ui.getCore().byId("primerApellido").setEnabled(true);
											sap.ui.getCore().byId("segundoApellido").setEnabled(true);
											sap.ui.getCore().byId("fecha_nacimiento").setEnabled(true);
											sap.ui.getCore().byId("motivoConsulta").setEnabled(true);
											sap.ui.getCore().byId("documento").setEnabled(false);
											sap.ui.getCore().byId("edad").setEditable(false);
										}                                		
										
									}

                                }).setModel(
                                    new sap.ui.model.json.JSONModel([{
                                        text: "Carnet de Identidad",
                                        key: "1"
                                    }, {
                                        text: "Carnet Extranjero",
                                        key: "2"
                                    }, {
                                        text: "Inconsciente",
                                        key: "3"
                                    }, {
                                        text: "Indocumentado",
                                        key: "4"
                                    }, {
                                        text: "Pasaporte",
                                        key: "5"
                                    }])
                                ).bindItems("/", new sap.ui.core.ListItem().bindProperty("text", "text").bindProperty("key", "key")),

                                new sap.ui.commons.TextField("documento", {
                                	change : function(oEvent){
                                		var rut = sap.ui.getCore().byId("documento").getValue();
                                		
                                		if(sap.ui.getCore().byId("oDropdownDocumentos").getSelectedKey()==="1"){ //Carnet de identidad
                                			checkRutField(rut);
                                			
//                                			var rutFormateado = formatoRut(rut);
//                                			sap.ui.getCore().byId("documento").setValue(rutFormateado);
										}
                                	}
                                
                                }),

     /*******************************************************************************************************************************/                               
                                
                                new sap.ui.commons.Label({
                                    text: "Fecha de Nacimiento"
                                }),
                                new sap.m.DatePicker("fecha_nacimiento", {
                                    valueFormat: "dd/MM/yyyy",
                                    displayFormat: "dd/MM/yyyy",
                                    change: function(oEvent) {
                                        sap.ui.getCore().byId("edad").setValue(
                                            SAP_UI.calculateAge(this.getValue().split("/")[2] + "/" +
                                                this.getValue().split("/")[1] + "/" +
                                                this.getValue().split("/")[0]))
                                    }
                                }),
                                new sap.ui.commons.Label({
                                    text: "Edad:"
                                }),
                                new sap.ui.commons.TextField("edad", {
                                    value: "",
                                    editable : false
                                }),
                                new sap.ui.commons.Label({
                                    text: "Sexo:"
                                }),
                                new sap.ui.commons.RadioButtonGroup("oRadioButtonSexo", {
                                    tooltip: "Sexo",
                                    selectedIndex: 4,
                                    columns: 4,
                                    select: function(oEvent) {
                                        console.log(this.getSelectedItem().getText());
                                    },
                                    items: [new sap.ui.core.Item({
                                            text: "Masculino ",
                                            tooltip: "Sexo Masculino",
                                            key: "M"
                                        }),
                                        new sap.ui.core.Item({
                                            text: "Femenino ",
                                            tooltip: "Sexo Femenino",
                                            key: "F"
                                        }),
                                        new sap.ui.core.Item({
                                            text: "Indeterminado ",
                                            tooltip: "Indeterminado",
                                            key: "I"
                                        }),
                                        new sap.ui.core.Item({
                                            text: "Desconocido ",
                                            tooltip: "Desconocido",
                                            key: "D"
                                        })
                                    ]
                                }),

                                new sap.ui.core.Title({
                                    text: "Detalle Consulta"
                                }),

                                new sap.ui.commons.Label({
                                    text: "Motivo Consulta"
                                }),
                                new sap.ui.commons.TextField("motivoConsulta", {}),

                                new sap.ui.commons.Label({
                                    text: "Tipo de Atención"
                                }),
                                new sap.ui.commons.DropdownBox("oDropdownTipoDeAtencion", {}).setModel(
                                    new sap.ui.model.json.JSONModel([{
                                        text: "Niño y Adulto",
                                        key: "1"
                                    }, {
                                        text: "Gineco-Obstetra",
                                        key: "2"
                                    }, {
                                        text: "Matrona",
                                        key: "3"
                                    }])
                                ).bindItems("/", new sap.ui.core.ListItem().bindProperty("text", "text").bindProperty("key", "key")),
                                new sap.ui.commons.Label({
                                    text: "Previsión"
                                }),
                                new sap.ui.commons.DropdownBox("oDropdownTipoPrevision", {}).setModel(
                                    new sap.ui.model.json.JSONModel([{
                                        text: "Fonasa",
                                        key: "1"
                                    }, {
                                        text: "Isapre",
                                        key: "2"
                                    }, {
                                        text: "Sin Previsión",
                                        key: "3"
                                    }, {
                                        text: "Capredena",
                                        key: "5"
                                    }, {
                                        text: "Dipreca",
                                        key: "6"
                                    }, {
                                        text: "Otra",
                                        key: "7"
                                    }, {
                                        text: "Ignorado",
                                        key: "9"
                                    }])
                                ).bindItems("/", new sap.ui.core.ListItem().bindProperty("text", "text").bindProperty("key", "key")),
                                new sap.ui.commons.Label({
                                    text: "Medio de Transporte "
                                }),
                                new sap.ui.commons.DropdownBox("oDropdownMedioTransporte", {}).setModel(
                                    new sap.ui.model.json.JSONModel([{
                                        text: "Ambulancia",
                                        key: "1"
                                    }, {
                                        text: "Vehículo de Carabineros o PDI",
                                        key: "2"
                                    }, {
                                        text: "Otros Vehículos Motorizado",
                                        key: "3"
                                    }, {
                                        text: "Otros Vehículos No Motorizado",
                                        key: "4"
                                    }, {
                                        text: "A pie",
                                        key: "5"
                                    }, {
                                        text: "Desconocido",
                                        key: "9"
                                    }])
                                ).bindItems("/", new sap.ui.core.ListItem().bindProperty("text", "text").bindProperty("key", "key"))
                            ]
                        })

                    ]
                }), new sap.m.IconTabFilter("listarPacientesNoCategorizados", {
                    text: "No Atendidos",
                    icon: "sap-icon://customer-history",
                    content: [
                        new sap.m.Table("oTable_pacientesNoCategorizados", {
                            mode: sap.m.ListMode.SingleSelectMaster,
                            columns: [
                                new sap.m.Column({
                                    minScreenWidth : "400px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Fecha y Hora",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	 minScreenWidth : "500px",
                                     demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Nombres",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	 minScreenWidth : "600px",
                                     demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Apellidos",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	 minScreenWidth : "700px",
                                     demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Edad",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	 minScreenWidth : "800px",
                                     demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Sexo",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	 minScreenWidth : "900px",
                                     demandPopin :  true,
                                     header: new sap.m.Label({
                                        text: "Categorizar",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                })

                            ]
                        })
                    ]
                }), new sap.m.IconTabFilter("listarPacientesCategorizados", {
                    text: "Categorizados",
                    icon: "sap-icon://activity-individual",
                    content: [
                        new sap.m.Table("oTable_pacientesCategorizados", {
                            mode: sap.m.ListMode.None,
                            columns: [
                                new sap.m.Column({
                                	minScreenWidth : "400px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Fecha y Hora",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	minScreenWidth : "500px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Nombres",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	minScreenWidth : "600px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Apellidos",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	minScreenWidth : "700px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Edad",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	minScreenWidth : "800px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Sexo",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	minScreenWidth : "900px",
                                    demandPopin :  true,
                                	header : new sap.m.Label({
                                		text : "Estado",
                                    	design : sap.m.LabelDesign.Bold	
                                	})
                                }),
                                new sap.m.Column({
                                	minScreenWidth : "950px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Cat.Historico",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	minScreenWidth : "1000px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Re-Categorizar",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	minScreenWidth : "1000px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Derivar",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                })
                            ]
                        })
                    ]
                }),new sap.m.IconTabFilter("listarPacientesAtendidos", {
                    text: "Atendidos",
                    icon: "sap-icon://visits",
                    content: [
                        new sap.m.Table("oTable_pacientesAtendidos", {
                            mode: sap.m.ListMode.SingleSelectMaster,
                            columns: [
                                new sap.m.Column({
                                    minScreenWidth : "400px",
                                    demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Fecha y Hora",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	 minScreenWidth : "500px",
                                     demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Nombres",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	 minScreenWidth : "600px",
                                     demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Apellidos",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	 minScreenWidth : "700px",
                                     demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Edad",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                                	 minScreenWidth : "800px",
                                     demandPopin :  true,
                                    header: new sap.m.Label({
                                        text: "Sexo",
                                    	design : sap.m.LabelDesign.Bold	
                                    })
                                }),
                                new sap.m.Column({
                               	 minScreenWidth : "900px",
                                    demandPopin :  true,
                                   header: new sap.m.Label({
                                       text: "Sintoma",
                                   	design : sap.m.LabelDesign.Bold	
                                   })
                               })
                            ]
                        })
                    ]
                })]
            })],
            footer: []

        });
        console.log(sectionPage);
        sectionPage == "registarPaciente" ? oPageDetail.setFooter(footerPage) : oPageDetail.setFooter(new sap.m.Toolbar({}))         
        oSplitApp.addDetailPage(oPageDetail);
        oSplitApp.toDetail(namePage);
        sap.ui.getCore().byId("mantenedorPaciente").setSelectedKey(sectionPage);

    },


    createDetailPage_SINTOMAS: function(oDataPaciente) {
    	
    	sap.ui.getCore().byId("oListMasterPage").removeSelections();

        for (var index = oSplitApp.getDetailPages().length - 1; index > 0; index--) {
            oSplitApp.getDetailPages()[index].destroy();
        }


        var dataItem = [];

        var objectStore = myDB.transaction(["SINTOMAS"]).objectStore("SINTOMAS");

        objectStore.openCursor().onsuccess = function(oEvent) {

            var cursor = oEvent.target.result;


            if (cursor) {

                dataItem.push({
                    ID: cursor.value.ID,
                    DESCRIPCION: cursor.value.DESCRIPCION.charAt(0).toUpperCase() + cursor.value.DESCRIPCION.slice(1).toLowerCase(),
                    ULTIMO_VALOR: cursor.value.ULTIMO_VALOR
                });

                cursor.continue();
            } else {

                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(dataItem);

                oPageDetail = new sap.m.Page("oSintomasPage", {
                    backgroundDesign: sap.m.PageBackgroundDesign.List,
                    title: "Categorias",
                    content: [new sap.m.ObjectHeader({
                    	responsive : true,
                    	intro:"Paciente",
                    	title: oDataPaciente.NOMBRES+" "+oDataPaciente.APELLIDOS,
                    	icon : "sap-icon://customer",
                    	number : "",
                    attributes : [
	                    new sap.m.ObjectAttribute({
	                    	title : "Edad",
	                    	text: oDataPaciente.EDAD	
	                    }),new sap.m.ObjectAttribute({
	                    	title : oDataPaciente.TIPO_DOCUMENTO,
	                    	text: oDataPaciente.DOCUMENTO
	                    }),new sap.m.ObjectAttribute({
	                    	title : "Motivo Consulta",
	                    	text: oDataPaciente.MOTIVO
	                    }),new sap.m.ObjectAttribute({
	                    	title : "Sexo",
	                    	text: oDataPaciente.SEXO
	                    })
	                    ,new sap.m.ObjectAttribute({
	                    	title : "Fecha de Nacimiento",
	                    	text: oDataPaciente.FECHA_NACIMIENTO
	                    })
	                    ,new sap.m.ObjectAttribute({
  	                    	title : "Tipo de Atención",
  	                    	text: oDataPaciente.TIPO_ATENCION
      	                })
                    ]}).addStyleClass("headerPatient"),
                    new sap.m.VBox({
                    	//width : "350px",
                    	width : "auto",
                        items: [new sap.m.SearchField({
                            width: "auto",
                            placeholder: "Buscar",
                            liveChange: function(oEvent) {
                                var tpmla = oEvent.getParameter("newValue");
                                var filters = new Array();
                                var oFilter = new sap.ui.model.Filter("DESCRIPCION", sap.ui.model.FilterOperator.Contains, tpmla);
                                filters.push(oFilter);
                                sap.ui.getCore().byId("listItems").getBinding("items").filter(filters);
                            }
                        }),
                        new sap.m.List("listItems", {
                            width: "auto",
                            mode: sap.m.ListMode.SingleSelect,
                            inset: false,
                            select: function(e) {

                                var itemSelected = this.getSelectedItems()[0];
                                var oData = itemSelected.getModel().oData[(itemSelected.getId()).split("-")[2]];

                                switch(oData.ULTIMO_VALOR){

                                    case "A Azul":
                                        oData.ULTIMO_VALOR = "Z";
                                        break;

                                    case "V Verde":
                                        oData.ULTIMO_VALOR = "V";
                                        break;
                                }
                                console.log("CURRENTDETAIL");
                                console.log(oSplitApp.getCurrentDetailPage());
                                SAP_UI.createDetailPage_Question(oData, "oQuestionsPage", oSplitApp.getCurrentDetailPage(), oDataPaciente);

                            }
                        }).bindItems({
                            path: "/",
                            template: new sap.m.StandardListItem({
                                title: "{DESCRIPCION}"
                            })
                        }).setModel(oModel)
                    ]
                }).addStyleClass("vBox")   
    			          ],
                    footer: new sap.m.Toolbar({
                        active: true,
                        content: [new sap.m.ToolbarSpacer({}),
                            /* new sap.m.Button({text : "Accept", type:"Accept"}),
                             new sap.m.Button({text : "Reject", type:"Reject"}),
                             new sap.m.Button({text : "Edit"}),
                             new sap.m.Button({text : "Delete"})*/
                        ]
                    })

                });

                oPageDetail.aColors = [];
                for (var index in colorsTreachByOrder) {
                    oPageDetail.aColors.push(colorsTreachByOrder[index]);
                }
  
                oSplitApp.addDetailPage(oPageDetail);
                oSplitApp.toDetail("oSintomasPage");
                
               // window.setTimeout(function(){sap.ui.getCore().byId("objectPageLayout_sintomasPage")._scrollTo(0,0)}, 500);
            }
        };

        objectStore.openCursor().onerror = function(oEvent) {
            console.log("Error Cursor");
            return;
        };

    },

    createDetailPage_Question: function(oData, pageName, previousPage, oDataPaciente) {

        var aSwitchButton = [];
        var arrayColor  = [];
	        
	    for (var index in previousPage.aColors) {
	           arrayColor.push(previousPage.aColors[index]);
	    }
	        
	    var colorPage = arrayColor.shift();
       
        var objectStore = myDB.transaction(["ESQUEMAS"]).objectStore("ESQUEMAS").index("ID_ESQUEMA_COLOR");
        objectStore.openCursor(IDBKeyRange.only([String(oData.ID), colorPage])).onsuccess = function(oEvent) {

            var cursor = oEvent.target.result;

            if (cursor) {
                var switchButton;

                var objectStore_ = myDB.transaction(["PREGUNTAS_E_INFORMACION"]).objectStore("PREGUNTAS_E_INFORMACION").index("PREGUNTA");

                objectStore_.openCursor(IDBKeyRange.only(String(cursor.value.PREGUNTA))).onsuccess = function(oEvent) {

                    var cursor_ = oEvent.target.result;

                    if (cursor_) {
                        aSwitchButton.push(
                            new sap.m.HBox({
                                items: [new sap.m.RadioButton({
                                    text: "Si",
                                    groupName: cursor_.value.PREGUNTA,
                                    enabled: false,
                                    select: function(oEvent) {
                                    	
                                    	var oData = this.getModel().oData.modelData;
                                    	var objectStore = myDB.transaction(["PREGUNTAS_E_INFORMACION"]).objectStore("PREGUNTAS_E_INFORMACION").index("PREGUNTA");

                                        objectStore.get(String(this.getModel().oData.modelData.PREGUNTA)).onsuccess = function(oEvent) {

                                            var data = oEvent.target.result;

                                            if (data) {
                                            	var objectStore = myDB.transaction(["CATEGORIA_PREGUNTA"]).objectStore("CATEGORIA_PREGUNTA");

                                                objectStore.get(data.TIPO_PREGUNTA).onsuccess = function(oEvent) {

                                                    var data = oEvent.target.result;	                        					                            
	                        						
                                                    if (data.SIGNOS_VITALES!="") {
                                                    	
                                                    	var dinamicForm = new sap.ui.layout.form.SimpleForm("oFormDetailQuestion",{
                                                    		 maxContainerCols: 2,
                                                             editable: true,
                                                             content : [
	                                                             new sap.ui.core.Title({
	                                                                 text: "Signos Vitales:"
	                                                             })
                                                             ]
                                                    	});
                                                    	
                                                    	var aDetailQuestion = data.SIGNOS_VITALES.split("|");
                                                    	
                                                    	for(var index in aDetailQuestion){                                                 		
                                                    		dinamicForm.addContent(new sap.ui.commons.Label({
                                                    			text:	aDetailQuestion[index],
                                                    			design: sap.m.LabelDesign.Bold
                                                    		}));
                                                    		
                                                    		dinamicForm.addContent(new sap.ui.commons.TextField({}));
                                                    	}
                                                    	
                                                    	var dialog =  new sap.m.Dialog({
            		                        				title: 'Registro',
            		                        				type: 'Message',
            		                        				resizable: true,
            		                        				content:[dinamicForm
            		                        				],
            		                        				beginButton: new sap.m.Button({
            		                        					text: 'Confirmar',
            		                        					press: function () {
            		                        						
            		                        						oDataPaciente.SINTOMA = [];
            		                        						var aDinamicForm = sap.ui.getCore().byId("oFormDetailQuestion").getContent();
            		                        						
            		                        						for(var index in aDinamicForm ){
            		                        							if(aDinamicForm[index].getId().indexOf("field") >= 0){
            		                        								oDataPaciente.SINTOMA+=aDinamicForm[index-1].getText()+": "+aDinamicForm[index].getValue()+"\n";
            		                        								}           
            		                        							}
            		                        						
            		                        						SAP_UI.createDetailPage_Result(oData, oDataPaciente)
            		                        						dialog.close();
            		                        					}
            		                        				}),
            		                        				endButton: new sap.m.Button({
            		                        					text: 'Cancelar',
            		                        					press: function () {
            		                        						dialog.close();
            		                        					}
            		                        				}),
            		                        				afterClose: function() {
            		                        					dialog.destroy();
            		                        				}
            		                        			}).open();
                                                    }else{                                     	
                                                    	 oDataPaciente.SINTOMA = "No presenta";
                                                    	 SAP_UI.createDetailPage_Result(oData, oDataPaciente)
                                                    }
                                                    	
                                                }  
                                            	
                                            }
                                        }    
                                        
                                    }
                                }).setModel(new sap.ui.model.json.JSONModel(({
                                    modelData: ({
                                        ID: cursor.value.ID_ESQUEMA,
                                        ID_COLOR: cursor.value.COLOR,
                                        PREGUNTA: cursor_.value.PREGUNTA,
                                        PREGUNTA_PACIENTE: cursor_.value.TEXT_BOTON.slice(0).toLowerCase()
                                    })
                                }))), new sap.m.RadioButton({
                                    text: "No",
                                    groupName: cursor_.value.PREGUNTA,
                                    enabled: false,
                                    select: function(oEvent) {
                                        var boxElementContainer = this.oParent.oParent.getItems();

                                    	for (var index = 0; index < boxElementContainer.length - 1; index++) {
                                            if (boxElementContainer[index].getItems()[1].getId() == this.getId()){
                                                if(index < boxElementContainer.length - 1){
                                                	boxElementContainer[index+1].getItems()[0].setEnabled(true);
                                                	boxElementContainer[index+1].getItems()[1].setEnabled(true);
                                                	break;
                                                }
                                            }
                                        }
                                    	
                                        for (var index in boxElementContainer) {
                                            if (boxElementContainer[index].getItems()[0].getSelected() ||
                                                !boxElementContainer[index].getItems()[1].getSelected()) {
                                                return;
                                            }
                                        }

                                        SAP_UI.createDetailPage_Question(this.getModel().oData.modelData, pageName, oSplitApp.getCurrentDetailPage(), oDataPaciente)
                                    }
                                }).setModel(new sap.ui.model.json.JSONModel(({
                                    modelData: ({
                                        ID: cursor.value.ID_ESQUEMA,
                                        ID_COLOR: cursor.value.COLOR,
                                        PREGUNTA: cursor_.value.PREGUNTA
                                    })
                                }))), new sap.m.Link({
                                    text: cursor_.value.TEXT_BOTON.charAt(1).toUpperCase() + cursor_.value.TEXT_BOTON.slice(2).toLowerCase(),
                                    press: function(oEvent) {
                                        jQuery.sap.require("sap.m.MessageBox");
                                        sap.m.MessageBox.show(
                                            cursor_.value.INFORMACION_PREGUNTA.charAt(0).toUpperCase() + cursor_.value.INFORMACION_PREGUNTA.slice(1).toLowerCase(), {
                                                icon: sap.m.MessageBox.Icon.INFORMATION,
                                                title: "Informaci\u00F3n",
                                                //actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                                                onClose: function(oAction) {
                                                    if (oAction === sap.m.MessageBox.Action.YES) {
                                                        // alert("YES");
                                                    }

                                                },
                                            }
                                        );

                                    }

                                }).addStyleClass("textQuestion")]
                            })
                        );

                        cursor_.continue();
                    }
                }

                cursor.continue();
            } else {

                var cssColor;

                switch (colorPage) {

                    case "R":
                        cssColor = "red";
                        break;
                    case "N":
                        cssColor = "orange";
                        break;
                    case "M":
                        cssColor = "yellow";
                        break;
                    case "V":
                        cssColor = "green";
                        break;
                    case "Z":
                        cssColor = "blue";
                        break;
                }
                
                aSwitchButton[0].getItems()[0].setEnabled(true);
                aSwitchButton[0].getItems()[1].setEnabled(true);
                
                oDetailPage = new sap.m.Page(pageName + "_" + colorPage, {
                    backgroundDesign: sap.m.PageBackgroundDesign.List,
                    title: "Clasificacion Triage",
                    headerContent: [new sap.m.Button({
                        icon: "sap-icon://nav-back",
                        tooltip: "back",
                        press: function(oEvent) {
                            var actualPage = oSplitApp.getCurrentDetailPage();
                            oSplitApp.backDetail();
                            actualPage.destroy();
                        }
                    })],
                    content: [new sap.m.ObjectHeader("oBjectHeader_"+colorPage,{
                    	responsive : true,
                    	//fullScreenOptimized: true,
                    	intro:"Paciente",
                    	title: oDataPaciente.NOMBRES+" "+oDataPaciente.APELLIDOS,
                    	icon : "sap-icon://customer",
                    	number : "",
                    attributes : [
          	                    new sap.m.ObjectAttribute({
        	                    	title : "Edad",
        	                    	text: oDataPaciente.EDAD	
        	                    }),new sap.m.ObjectAttribute({
        	                    	title : oDataPaciente.TIPO_DOCUMENTO,
        	                    	text: oDataPaciente.DOCUMENTO
        	                    }),new sap.m.ObjectAttribute({
        	                    	title : "Motivo Consulta",
        	                    	text: oDataPaciente.MOTIVO
        	                    }),new sap.m.ObjectAttribute({
        	                    	title : "Sexo",
        	                    	text: oDataPaciente.SEXO
        	                    })
        	                    ,new sap.m.ObjectAttribute({
        	                    	title : "Fecha de Nacimiento",
        	                    	text: oDataPaciente.FECHA_NACIMIENTO
        	                    })
          	                  ,new sap.m.ObjectAttribute({
      	                    	title : "Tipo de Atención",
      	                    	text: oDataPaciente.TIPO_ATENCION
          	                  })
          	                    
                            ],
	                    
                    }).addStyleClass("headerPatient"),
                    new sap.m.VBox("boxSwitchColor_" + colorPage, {
                        items: [aSwitchButton]
                    })
                    ],
                    
                    footer: new sap.m.Toolbar({
                        active: true,
                        content: []
                    })

                });
                
                oDetailPage.aColors = arrayColor
                oSplitApp.addDetailPage(oDetailPage);
                oSplitApp.toDetail(pageName + "_" + colorPage);
                
//                var filterBarColor = document.getElementsByClassName("sapMITBContentArrow")[oSplitApp.getDetailPages().length - 2];
//                filterBarColor.style.borderBottomColor = cssColor;
//               // filterBarColor.style.style.borderBottom = "9px solid";
//                document.getElementById("filterIconTab_"+colorPage).style.width = "90%";

            }

        };

        objectStore.openCursor().onerror = function(oEvent) {
            console.log("Error Cursor");
            return;
        };

    },

    createDetailPage_Result: function(oData, oDataPaciente) {

        var objectStore = myDB.transaction(["CLASIFICACION_TRIAJE"]).objectStore("CLASIFICACION_TRIAJE").index("COLOR_ID");

        var request = objectStore.get(String(oData.ID_COLOR));

        request.onsuccess = function(oEvent) {

            var data = request.result;
            	            	
            if (data) {
            	
                oSplitApp.addDetailPage(
                    new sap.m.Page("oPageResult", {
                        backgroundDesign: sap.m.PageBackgroundDesign.List,
                        title: "Clasificacion Triage",
                        headerContent: [],
                        subHeader: new sap.m.Toolbar({
                            active: true,
                            design: sap.m.ToolbarDesign.Transparent,
                            content: [
                                new sap.ui.core.Icon({
                                    src: "sap-icon://activity-individual",
                                    size: "32px",
                                    color: "black",
                                    activeColor: "white",
                                    activeBackgroundColor: "#333333",
                                    hoverColor: "#eeeeee",
                                    hoverBackgroundColor: "#666666",
                                    width: "60px",
                                }).addStyleClass("iconDoctor"),
                                new sap.m.Label({
                                    text: "Clasificacion de Triage",
                                    design: sap.m.LabelDesign.Bold
                                })
                            ]
                        }),
                        content: [new sap.m.ObjectHeader({
                        	responsive : true,
                        	//fullScreenOptimized: true,
                        	intro:"Paciente",
                        	title: oDataPaciente.NOMBRES+" "+oDataPaciente.APELLIDOS,
                        	icon : "sap-icon://customer",
                        	number : "",
                        attributes : [
              	                    new sap.m.ObjectAttribute({
            	                    	title : "Edad",
            	                    	text: oDataPaciente.EDAD	
            	                    }),new sap.m.ObjectAttribute({
            	                    	title : oDataPaciente.TIPO_DOCUMENTO,
            	                    	text: oDataPaciente.DOCUMENTO
            	                    }),new sap.m.ObjectAttribute({
            	                    	title : "Motivo Consulta",
            	                    	text: oDataPaciente.MOTIVO
            	                    }),new sap.m.ObjectAttribute({
            	                    	title : "Sexo",
            	                    	text: oDataPaciente.SEXO
            	                    })
            	                    ,new sap.m.ObjectAttribute({
            	                    	title : "Fecha de Nacimiento",
            	                    	text: oDataPaciente.FECHA_NACIMIENTO
            	                    })
              	                  ,new sap.m.ObjectAttribute({
            	                    	title : "Tipo de Atención",
            	                    	text: oDataPaciente.TIPO_ATENCION
                	                  })
                                ]
    	                    }).addStyleClass("headerPatient"),
    	                    new sap.m.Table({
                                mode: sap.m.ListMode.None,
                                columns: [
                                    new sap.m.Column({
                                    	minScreenWidth : "450px",
                                        demandPopin :  true,
                                        header: new sap.m.Label({
                                            text: "Nivel de Urgencia",
                                        	design : sap.m.LabelDesign.Bold	
                                        })
                                    }),
                                    new sap.m.Column({
                                    	minScreenWidth : "550px",
                                        demandPopin :  true,
                                        header: new sap.m.Label({
                                            text: "Tipo de Urgencia",
                                        	design : sap.m.LabelDesign.Bold	
                                        })
                                    }),
                                    new sap.m.Column({
                                    	minScreenWidth : "700px",
                                        demandPopin :  true,
                                        header: new sap.m.Label({
                                            text: "Color",
                                        	design : sap.m.LabelDesign.Bold	
                                        })
                                    }),
                                    new sap.m.Column({
                                    	minScreenWidth : "900px",
                                        demandPopin :  true,
                                        header: new sap.m.Label({
                                            text: "Tiempo de espera",
                                        	design : sap.m.LabelDesign.Bold	
                                        })
                                    }),
                                    new sap.m.Column({
                                    	minScreenWidth : "1000px",
                                        demandPopin :  true,
                                        header: new sap.m.Label({
                                            text: "Sintoma",
                                        	design : sap.m.LabelDesign.Bold	
                                        })
                                    }),
                                    new sap.m.Column({
                                    	minScreenWidth : "1100px",
                                        demandPopin :  true,
                                        header: new sap.m.Label({
                                            text: "	Detalle",
                                        	design : sap.m.LabelDesign.Bold	
                                        })
                                    })             
                                ]
                            }).setModel(new sap.ui.model.json.JSONModel([data]))
                            .bindItems("/", new sap.m.ColumnListItem({
                                cells: [new sap.m.Text({
                                    text: "{NIVEL_URGENCIA}"
                                }), new sap.m.Text({
                                    text: "{TIPO_URGENCIA}"
                                }), new sap.m.HBox({
                                    items: [
                                        new sap.m.Text({
                                            text: "{COLOR}"
                                        }),
                                        new sap.ui.core.Icon({
                                            src: "sap-icon://overlay",
                                            size: "17px",
                                            color: "{CSS_COLOR}",
                                            activeColor: "white",
                                            activeBackgroundColor: "#333333",
                                            hoverColor: "#eeeeee",
                                            hoverBackgroundColor: "#666666",
                                            width: "60px",
                                        })
                                    ]
                                }), new sap.m.Text({
                                    text: "{TIEMPO_ESPERA}"
                                }), new sap.m.Text({
                                    text: oData.PREGUNTA_PACIENTE.substring(1, oData.PREGUNTA_PACIENTE.length - 1)
                                }), new sap.m.Text({
                                    text: oDataPaciente.SINTOMA
                                })]
                            }))
                        ],
                        footer: new sap.m.Toolbar({
                            active: true,
                            content: [new sap.m.ToolbarSpacer({}),
                                new sap.m.Button({
                                    text: "Registrar",
                                    type: "Accept",
                                    press: function(oEvent) {
                                    	
                                        jQuery.sap.require("sap.m.MessageBox");
                                        sap.m.MessageBox.success("Se ha registrado la categorizacion con Exito", {
                                            title: "Confirmacion",
                                        });
                                        
                                        SAP_UI.updateData_pacientes(oDataPaciente, data, oData.PREGUNTA_PACIENTE.substring(1, oData.PREGUNTA_PACIENTE.length - 1));
                                    }
                                }),
                                new sap.m.Button({
                                    text: "Cancelar",
                                    type: "Reject",
                                    press: function(oEvent) {
                                    	SAP_UI.createDetailPage_SINTOMAS(oDataPaciente);
                                    }
                                })
                            ]
                        })

                    }));

                oSplitApp.toDetail("oPageResult");
            }

        };


    },
    
		    prepareIDB: function() {
				
				if(window.indexedDB == null){
					console.log("Object IndexesDB is not supported in thos browser");
				}
				
				//var request = window.indexedDB.open("OFFLINE_DB__",1); // Create Data Bases NoSQL
				
				//This request has count with 2 event that are onupgradeneeded followed by onsuccess
				   // window.indexedDB.deleteDatabase('OFFLINE_DB') // Delete DB
				var request = window.indexedDB.open("OFFLINE_DB",1); // (Name of DB, versi�n DB (possible update))
				    
				request.onupgradeneeded = function(oEvent){
					
					var db = oEvent.target.result; // oController.myDB is a global variable on defined in index.html
		
					var objectStore = db.createObjectStore("SINTOMAS",{ keyPath: "ID", autoIncrement : true}); 			
					
					  objectStore.createIndex("DESCRIPCION", "DESCRIPCION", {unique : false });
			          objectStore.createIndex("ULTIMO_VALOR", "ULTIMO_VALOR", { unique: false });
			          
			          objectStore = db.createObjectStore("ESQUEMAS",{ keyPath: "ID",autoIncrement : true});   
			          objectStore.createIndex("ID_ESQUEMA", "ID_ESQUEMA", {unique : false });	          
					  objectStore.createIndex("COLOR", "COLOR", {unique : false });
			          objectStore.createIndex("ORDEN_PULSADOR", "ORDEN_PULSADOR", { unique: false });
			          objectStore.createIndex("PREGUNTA", "PREGUNTA", { unique: false });
			          objectStore.createIndex('ID_ESQUEMA_COLOR', ['ID_ESQUEMA','COLOR'],{unique:false});
			          
			          objectStore = db.createObjectStore("PREGUNTAS_E_INFORMACION",{ keyPath: "PREGUNTA"}); 			
					  objectStore.createIndex("PREGUNTA", "PREGUNTA", {unique : false });
			          objectStore.createIndex("TEXT_BOTON", "TEXT_BOTON", { unique: false });
			          objectStore.createIndex("INFORMACION_PREGUNTA", "INFORMACION_PREGUNTA", { unique: false });
			          objectStore.createIndex("TIPO_PREGUNTA", "TIPO_PREGUNTA", { unique: false });

			          
			          objectStore = db.createObjectStore("PACIENTE",{ keyPath: "ID", autoIncrement : true}); 			
					  objectStore.createIndex("NOMBRES", "NOMBRES", {unique : false });
					  objectStore.createIndex("PRIMER_APELLIDO", "PRIMER_APELLIDO", { unique: false });
					  objectStore.createIndex("SEGUNDO_APELLIDO", "SEGUNDO_APELLIDO", { unique: false });
			          objectStore.createIndex("TIPO_DOCUMENTO", "TIPO_DOCUMENTO", { unique: false });	
			          objectStore.createIndex("DOCUMENTO", "DOCUMENTO", { unique: false });		
					  objectStore.createIndex("SEXO", "SEXO", {unique : false });
			          objectStore.createIndex("FECHA_NACIMIENTO", "FECHA_NACIMIENTO", { unique: false });
			          objectStore.createIndex("MOTIVO", "CONSULTA", { unique: false });
			          objectStore.createIndex("TIPO_ATENCION", "TIPO_ATENCION", { unique: false });
			          objectStore.createIndex("FECHA_HORA_INGRESO", "FECHA_HORA_INGRESO", { unique: false });
			          objectStore.createIndex("FECHA_HORA_CATEGORIZACION", "FECHA_HORA_CATEGORIZACION", { unique: false });
			          objectStore.createIndex("CATEGORIZADO", "CATEGORIZADO", { unique: false });
			          objectStore.createIndex("CANT_CATEGORIZADO", "CANT_CATEGORIZADO", { unique: false });
			          objectStore.createIndex("NIVEL_URGENCIA", "NIVEL_URGENCIA", { unique: false });
			          objectStore.createIndex("MEDIO_TRANSPORTE", "MEDIO_TRANSPORTE", { unique: false });
			          objectStore.createIndex("PREVISION", "PREVISION", { unique: false });
			          objectStore.createIndex("SINTOMA", "SINTOMA", { unique: false });
			          objectStore.createIndex('PRIORIDAD', ['NIVEL_URGENCIA','CATEGORIZADO','FECHA_HORA_INGRESO'], {unique:false});
			          
			          objectStore = db.createObjectStore("PACIENTE_DERIVADO",{ keyPath: "ID", autoIncrement : true}); 			
					  objectStore.createIndex("NOMBRES", "NOMBRES", {unique : false });
					  objectStore.createIndex("PRIMER_APELLIDO", "PRIMER_APELLIDO", { unique: false });
					  objectStore.createIndex("SEGUNDO_APELLIDO", "SEGUNDO_APELLIDO", { unique: false });
			          objectStore.createIndex("TIPO_DOCUMENTO", "TIPO_DOCUMENTO", { unique: false });	
			          objectStore.createIndex("DOCUMENTO", "DOCUMENTO", { unique: false });		
					  objectStore.createIndex("SEXO", "SEXO", {unique : false });
			          objectStore.createIndex("FECHA_NACIMIENTO", "FECHA_NACIMIENTO", { unique: false });
			          objectStore.createIndex("MOTIVO", "CONSULTA", { unique: false });
			          objectStore.createIndex("TIPO_ATENCION", "TIPO_ATENCION", { unique: false });
			          objectStore.createIndex("FECHA_HORA_INGRESO", "FECHA_HORA_INGRESO", { unique: false });
			          objectStore.createIndex("FECHA_HORA_CATEGORIZACION", "FECHA_HORA_CATEGORIZACION", { unique: false });
			          objectStore.createIndex("FECHA_HORA_DERIVACION", "FECHA_HORA_DERIVACION", { unique: false });
			          objectStore.createIndex("CATEGORIZADO", "CATEGORIZADO", { unique: false });
			          objectStore.createIndex("NIVEL_URGENCIA", "NIVEL_URGENCIA", { unique: false });
			          objectStore.createIndex("MEDIO_TRANSPORTE", "MEDIO_TRANSPORTE", { unique: false });
			          objectStore.createIndex("PREVISION", "PREVISION", { unique: false });
			          objectStore.createIndex("SINTOMA", "SINTOMA", { unique: false });
			          objectStore.createIndex("DERIVACION", "DERIVACION", { unique: false });
			          objectStore.createIndex("OBSERVACIONES", "OBSERVACIONES", { unique: false });
			          
			          objectStore = db.createObjectStore("CLASIFICACION_TRIAJE",{ keyPath: "NIVEL_URGENCIA"});
			          objectStore.createIndex("COLOR_ID", "COLOR_ID", {unique : false });
			          objectStore.createIndex("TIPO_URGENCIA", "COLOR_ID", {unique : false });
			          objectStore.createIndex("COLOR", "COLOR", {unique : false });
			          objectStore.createIndex("CSS_COLOR", "CSS_COLOR", {unique : false });
			          objectStore.createIndex("TIEMPO_ESPERA", "TIEMPO_ESPERA", {unique : false });
			          
			          objectStore = db.createObjectStore("CATEGORIA_PREGUNTA",{ keyPath: "ID"}); 			
					  objectStore.createIndex("SIGNOS_VITALES", "SIGNOS_VITALES", {unique : false });
			          objectStore.createIndex("NUM_CARACTERES", "NUM_CARACTERES", { unique: false });
			          objectStore.createIndex("FORMATO", "FORMATO", { unique: false });
			          
			          objectStore = db.createObjectStore("CATEGORIZADO",{ keyPath: "ID", autoIncrement : true}); 	
			          objectStore.createIndex("ID_PACIENTE", "ID_PACIENTE", {unique : false });
					  objectStore.createIndex("FECHA_HORA", "FECHA_HORA", {unique : false });
			          objectStore.createIndex("DISCRIMINADOR", "DISCRIMINADOR", { unique: false });
			          objectStore.createIndex("CATEGORIA", "CATEGORIA", { unique: false });
			          
			          myDB = oEvent.target.result;
			          
				};
				
				request.onsuccess = function(oEvent){
					//Object stores already exist (or) have now been created. store reference to DB
					myDB = oEvent.target.result;
					
					SAP_UI.writeIDB("CLASIFICACION_TRIAJE",[			                 
						{NIVEL_URGENCIA : "1", COLOR_ID : "R", TIPO_URGENCIA : "Resucitacitación", COLOR : "Rojo", CSS_COLOR : "red", TIEMPO_ESPERA : "Atención Inmediata"},
						{NIVEL_URGENCIA : "2", COLOR_ID : "N", TIPO_URGENCIA : "Emergencia", COLOR : "Naranja", CSS_COLOR : "orange", TIEMPO_ESPERA : "10-15 Minutos"},
						{NIVEL_URGENCIA : "3", COLOR_ID : "M", TIPO_URGENCIA : "Urgencia", COLOR : "Amarillo", CSS_COLOR : "yellow", TIEMPO_ESPERA : "60 Minutos"},
						{NIVEL_URGENCIA : "4", COLOR_ID : "V", TIPO_URGENCIA : "Urgencia Menor", COLOR : "Verde", CSS_COLOR : "green", TIEMPO_ESPERA : "2 Horas"},
						{NIVEL_URGENCIA : "5", COLOR_ID : "Z", TIPO_URGENCIA : "Sin Urgencia", COLOR : "Azul", CSS_COLOR : "blue", TIEMPO_ESPERA : "4 Horas"}
					]);			              			
					
					SAP_UI.writeIDB("CATEGORIA_PREGUNTA",[			                 
						{ID : "0", SIGNOS_VITALES : "" , NUM_CARACTERES :""},
						{ID : "1", SIGNOS_VITALES : "Hora" , NUM_CARACTERES :"6"},
						{ID : "2", SIGNOS_VITALES : "Pulso", NUM_CARACTERES :"3"},
						{ID : "3", SIGNOS_VITALES : "Presión Arterial", NUM_CARACTERES :"7"},
						{ID : "4", SIGNOS_VITALES : "Temperatura axilar", NUM_CARACTERES :"3"},
						{ID : "5", SIGNOS_VITALES : "Frecuencia Respiratoria", NUM_CARACTERES :	"2"},
						{ID : "6", SIGNOS_VITALES : "Saturación", NUM_CARACTERES :"3"},
						{ID : "7", SIGNOS_VITALES : "Escala visual an�loga(EVA)", NUM_CARACTERES :"2"},
						{ID : "8", SIGNOS_VITALES : "Escala de Glasgow", NUM_CARACTERES : "1"},
						{ID : "9", SIGNOS_VITALES : "Temperatura rectal", NUM_CARACTERES : "3"},
						{ID : "10",SIGNOS_VITALES : "Temp.Axilar|Temp.Rectal", NUM_CARACTERES : "3"},
					    {ID : "11",SIGNOS_VITALES : "Hora|Pulso|Presión Arterial|Temp.Axilar|Frec.Respiratoria|" +
					    "Saturación|E.V.A|Esc.Glasgow|Temp.Rectal", NUM_CARACTERES : "3"}
            		]);	
					
					SAP_UI.writeIDB("SINTOMAS",[			                 
		       		  { DESCRIPCION: "ADULTO CON MAL ESTADO GENERAL", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "ADULTO CON SINCOPE O LIPOTIMIA", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "AGRESION", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "APARENTEMENTE EBRIO", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "AUTOLESION (DELIBERADA) ", ULTIMO_VALOR : "V Verde"},
		              { DESCRIPCION: "ASMA", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "BEBE O NI\xD1O QUE LLORA", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "CAIDAS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "CEFALEA", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "COMPORTAMIENTO EXTRA\xD1O", ULTIMO_VALOR : "V Verde"},
		              { DESCRIPCION: "CONVULSIONES", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "CUERPO EXTRA\xD1O", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DIABETES", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DIARREA Y V\xD3MITO", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DISNEA EN ADULTOS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DISNEA EN NI\xD1OS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DOLOR ABDOMINAL", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DOLOR ABDOMINAL EN NI\xD1OS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DOLOR DE CUELLO", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DOLOR DE ESPALDA", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DOLOR DE GARGANTA", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DOLOR TESTICULAR", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "DOLOR TORACICO", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "EMBARAZO", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "ENFERMEDAD HEMATOLOGICA", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "ENFERMEDAD MENTAL", ULTIMO_VALOR : "V Verde"},
		              { DESCRIPCION: "ENFERMEDAD DE TRANSMISION SEXUAL", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "EXANTEMAS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "EXPOSICION A SUSTANCIAS QUIMICAS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "HEMORRAGIA GASTROINTESTINAL", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "HEMORRAGIA VAGINAL", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "HERIDAS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "INFECCIONES LOCALES Y ABSCESOS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "LESIONES EN EL TRONCO", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "MORDEDURAS Y PICADURAS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "NI\xD1O COJEANDO", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "NI\xD1O CON MAL ESTADO GENERAL", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "NI\xD1O IRRITABLE", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "PADRES PREOCUPADOS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "POLITRAUMATISMO", ULTIMO_VALOR : "V Verde"},
		              { DESCRIPCION: "PROBLEMA EN LAS EXTREMIDADES", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "PROBLEMA DE OIDOS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "PROBLEMAS DENTALES", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "PROBLEMAS FACIALES", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "PROBLEMAS OCULARES", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "PROBLEMAS URINARIOS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "QUEMADURAS Y EROSIONES", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "SOBREDOSIS Y ENVENENAMIENTO", ULTIMO_VALOR : "V Verde"},
		              { DESCRIPCION: "TRAUMATISMO CRANEOENCEFALICO", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "PALPITACIONES", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "ALERGIAS", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "ABUSO O MALTRATO INFANTIL", ULTIMO_VALOR : "V Verde"},
		              { DESCRIPCION: "BEBE EN MAL ESTADO GENERAL", ULTIMO_VALOR :"A Azul"},
		              { DESCRIPCION: "NEONATO EN MAL ESTADO GENERAL", ULTIMO_VALOR :"A Azul"}
					 ]);
					
					 
					SAP_UI.writeIDB("ESQUEMAS",[ 
						{ ID_ESQUEMA : "1" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0101"},     
						{ ID_ESQUEMA : "1" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0301"},     
						{ ID_ESQUEMA : "1" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0201"},     
						{ ID_ESQUEMA : "1" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0401"},     
						{ ID_ESQUEMA : "1" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0501"},     
						{ ID_ESQUEMA : "1" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0601"},     
						{ ID_ESQUEMA : "1" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0701"},     
						{ ID_ESQUEMA : "1" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0801"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0101"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0201"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0301"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0401"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0501"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0601"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0701"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0801"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0901"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "10", PREGUNTA : "IDN1001"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "11", PREGUNTA : "IDN1101"},     
						{ ID_ESQUEMA : "1" , COLOR : "N" , ORDEN_PULSADOR : "12", PREGUNTA : "IDN1201"},     
						{ ID_ESQUEMA : "1" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0101"},     
						{ ID_ESQUEMA : "1" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0201"},     
						{ ID_ESQUEMA : "1" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0301"},     
						{ ID_ESQUEMA : "1" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0401"},     
						{ ID_ESQUEMA : "1" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0501"},     
						{ ID_ESQUEMA : "1" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0101"},     
						{ ID_ESQUEMA : "1" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0201"},     
						{ ID_ESQUEMA : "1" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0301"},     
						{ ID_ESQUEMA : "1" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0101"},     
						{ ID_ESQUEMA : "2" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0102"},     
						{ ID_ESQUEMA : "2" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0202"},     
						{ ID_ESQUEMA : "2" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0302"},     
						{ ID_ESQUEMA : "2" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0402"},     
						{ ID_ESQUEMA : "2" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0502"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0102"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0202"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0302"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0402"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0502"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0602"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0702"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0802"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0902"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "10", PREGUNTA : "IDN1002"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "11", PREGUNTA : "IDN1102"},     
						{ ID_ESQUEMA : "2" , COLOR : "N" , ORDEN_PULSADOR : "12", PREGUNTA : "IDN1202"},     
						{ ID_ESQUEMA : "2" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0102"},     
						{ ID_ESQUEMA : "2" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0202"},     
						{ ID_ESQUEMA : "2" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0302"},     
						{ ID_ESQUEMA : "2" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0402"},     
						{ ID_ESQUEMA : "2" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0502"},     
						{ ID_ESQUEMA : "2" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0102"},     
						{ ID_ESQUEMA : "2" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0202"},     
						{ ID_ESQUEMA : "2" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0302"},     
						{ ID_ESQUEMA : "2" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0102"},     
						{ ID_ESQUEMA : "3" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0103"},     
						{ ID_ESQUEMA : "3" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0203"},     
						{ ID_ESQUEMA : "3" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0303"},     
						{ ID_ESQUEMA : "3" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0403"},     
						{ ID_ESQUEMA : "3" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0503"},     
						{ ID_ESQUEMA : "3" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0103"},     
						{ ID_ESQUEMA : "3" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0203"},     
						{ ID_ESQUEMA : "3" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0303"},     
						{ ID_ESQUEMA : "3" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0403"},     
						{ ID_ESQUEMA : "3" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0503"},     
						{ ID_ESQUEMA : "3" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0603"},     
						{ ID_ESQUEMA : "3" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0103"},     
						{ ID_ESQUEMA : "3" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0203"},     
						{ ID_ESQUEMA : "3" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0303"},     
						{ ID_ESQUEMA : "3" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0403"},     
						{ ID_ESQUEMA : "3" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0503"},     
						{ ID_ESQUEMA : "3" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0103"},     
						{ ID_ESQUEMA : "3" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0203"},     
						{ ID_ESQUEMA : "3" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0303"},     
						{ ID_ESQUEMA : "3" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0403"},     
						{ ID_ESQUEMA : "3" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0103"},     
						{ ID_ESQUEMA : "4" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0104"},     
						{ ID_ESQUEMA : "4" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0204"},     
						{ ID_ESQUEMA : "4" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0304"},     
						{ ID_ESQUEMA : "4" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0404"},     
						{ ID_ESQUEMA : "4" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0504"},     
						{ ID_ESQUEMA : "4" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0104"},     
						{ ID_ESQUEMA : "4" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0204"},     
						{ ID_ESQUEMA : "4" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0304"},     
						{ ID_ESQUEMA : "4" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0404"},     
						{ ID_ESQUEMA : "4" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0104"},     
						{ ID_ESQUEMA : "4" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0204"},     
						{ ID_ESQUEMA : "4" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0304"},     
						{ ID_ESQUEMA : "4" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0404"},     
						{ ID_ESQUEMA : "4" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0504"},     
						{ ID_ESQUEMA : "4" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0604"},     
						{ ID_ESQUEMA : "4" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0104"},     
						{ ID_ESQUEMA : "4" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0204"},     
						{ ID_ESQUEMA : "4" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0104"},     
						{ ID_ESQUEMA : "5" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0105"},     
						{ ID_ESQUEMA : "5" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0205"},     
						{ ID_ESQUEMA : "5" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0305"},     
						{ ID_ESQUEMA : "5" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0405"},     
						{ ID_ESQUEMA : "5" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0505"},     
						{ ID_ESQUEMA : "5" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0605"},     
						{ ID_ESQUEMA : "5" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0105"},     
						{ ID_ESQUEMA : "5" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0205"},     
						{ ID_ESQUEMA : "5" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0305"},     
						{ ID_ESQUEMA : "5" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0405"},     
						{ ID_ESQUEMA : "5" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0505"},     
						{ ID_ESQUEMA : "5" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0605"},     
						{ ID_ESQUEMA : "5" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0105"},     
						{ ID_ESQUEMA : "5" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0205"},     
						{ ID_ESQUEMA : "5" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0305"},     
						{ ID_ESQUEMA : "5" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0405"},     
						{ ID_ESQUEMA : "5" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0105"},     
						{ ID_ESQUEMA : "6" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0106"},     
						{ ID_ESQUEMA : "6" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0206"},     
						{ ID_ESQUEMA : "6" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0306"},     
						{ ID_ESQUEMA : "6" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0406"},     
						{ ID_ESQUEMA : "6" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0106"},     
						{ ID_ESQUEMA : "6" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0206"},     
						{ ID_ESQUEMA : "6" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0306"},     
						{ ID_ESQUEMA : "6" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0406"},     
						{ ID_ESQUEMA : "6" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0506"},     
						{ ID_ESQUEMA : "6" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0606"},     
						{ ID_ESQUEMA : "6" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0706"},     
						{ ID_ESQUEMA : "6" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0106"},     
						{ ID_ESQUEMA : "6" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0206"},     
						{ ID_ESQUEMA : "6" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0306"},     
						{ ID_ESQUEMA : "6" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0406"},     
						{ ID_ESQUEMA : "6" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0106"},     
						{ ID_ESQUEMA : "6" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0206"},     
						{ ID_ESQUEMA : "6" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0306"},     
						{ ID_ESQUEMA : "6" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0106"},     
						{ ID_ESQUEMA : "7" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0107"},     
						{ ID_ESQUEMA : "7" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0207"},     
						{ ID_ESQUEMA : "7" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0307"},     
						{ ID_ESQUEMA : "7" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0407"},     
						{ ID_ESQUEMA : "7" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0507"},     
						{ ID_ESQUEMA : "7" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0607"},     
						{ ID_ESQUEMA : "7" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0707"},     
						{ ID_ESQUEMA : "7" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0107"},     
						{ ID_ESQUEMA : "7" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0207"},     
						{ ID_ESQUEMA : "7" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0307"},     
						{ ID_ESQUEMA : "7" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0407"},     
						{ ID_ESQUEMA : "7" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0507"},     
						{ ID_ESQUEMA : "7" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0607"},     
						{ ID_ESQUEMA : "7" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0707"},     
						{ ID_ESQUEMA : "7" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0107"},     
						{ ID_ESQUEMA : "7" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0207"},     
						{ ID_ESQUEMA : "7" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0307"},     
						{ ID_ESQUEMA : "7" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0407"},     
						{ ID_ESQUEMA : "7" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0107"},     
						{ ID_ESQUEMA : "7" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0207"},     
						{ ID_ESQUEMA : "7" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0307"},     
						{ ID_ESQUEMA : "7" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0407"},     
						{ ID_ESQUEMA : "7" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0107"},     
						{ ID_ESQUEMA : "8" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0108"},     
						{ ID_ESQUEMA : "8" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0208"},     
						{ ID_ESQUEMA : "8" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0308"},     
						{ ID_ESQUEMA : "8" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0408"},     
						{ ID_ESQUEMA : "8" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0508"},     
						{ ID_ESQUEMA : "8" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0608"},     
						{ ID_ESQUEMA : "8" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0708"},     
						{ ID_ESQUEMA : "8" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0808"},     
						{ ID_ESQUEMA : "8" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0108"},     
						{ ID_ESQUEMA : "8" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0208"},     
						{ ID_ESQUEMA : "8" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0308"},     
						{ ID_ESQUEMA : "8" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0408"},     
						{ ID_ESQUEMA : "8" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0508"},     
						{ ID_ESQUEMA : "8" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0608"},     
						{ ID_ESQUEMA : "8" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0708"},     
						{ ID_ESQUEMA : "8" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0808"},     
						{ ID_ESQUEMA : "8" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0108"},     
						{ ID_ESQUEMA : "8" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0208"},     
						{ ID_ESQUEMA : "8" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0308"},     
						{ ID_ESQUEMA : "8" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0408"},     
						{ ID_ESQUEMA : "8" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0508"},     
						{ ID_ESQUEMA : "8" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0608"},     
						{ ID_ESQUEMA : "8" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0108"},     
						{ ID_ESQUEMA : "8" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0208"},     
						{ ID_ESQUEMA : "8" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0308"},     
						{ ID_ESQUEMA : "8" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0408"},     
						{ ID_ESQUEMA : "8" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0108"},     
						{ ID_ESQUEMA : "9" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0109"},     
						{ ID_ESQUEMA : "9" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0209"},     
						{ ID_ESQUEMA : "9" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0309"},     
						{ ID_ESQUEMA : "9" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0409"},     
						{ ID_ESQUEMA : "9" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0509"},     
						{ ID_ESQUEMA : "9" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0609"},     
						{ ID_ESQUEMA : "9" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0709"},     
						{ ID_ESQUEMA : "9" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0808"},     
						{ ID_ESQUEMA : "9" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0109"},     
						{ ID_ESQUEMA : "9" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0209"},     
						{ ID_ESQUEMA : "9" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0309"},     
						{ ID_ESQUEMA : "9" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0409"},     
						{ ID_ESQUEMA : "9" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0509"},     
						{ ID_ESQUEMA : "9" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0609"},     
						{ ID_ESQUEMA : "9" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0709"},     
						{ ID_ESQUEMA : "9" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0809"},     
						{ ID_ESQUEMA : "9" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0909"},     
						{ ID_ESQUEMA : "9" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0109"},     
						{ ID_ESQUEMA : "9" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0209"},     
						{ ID_ESQUEMA : "9" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0309"},     
						{ ID_ESQUEMA : "9" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0409"},     
						{ ID_ESQUEMA : "9" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0509"},     
						{ ID_ESQUEMA : "9" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0109"},     
						{ ID_ESQUEMA : "9" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0209"},     
						{ ID_ESQUEMA : "9" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0309"},     
						{ ID_ESQUEMA : "9" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0409"},     
						{ ID_ESQUEMA : "9" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0109"},     
						{ ID_ESQUEMA : "10" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0110"},     
						{ ID_ESQUEMA : "10" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0210"},     
						{ ID_ESQUEMA : "10" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0310"},     
						{ ID_ESQUEMA : "10" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0410"},     
						{ ID_ESQUEMA : "10" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0510"},     
						{ ID_ESQUEMA : "10" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0610"},     
						{ ID_ESQUEMA : "10" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0110"},     
						{ ID_ESQUEMA : "10" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0210"},     
						{ ID_ESQUEMA : "10" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0310"},     
						{ ID_ESQUEMA : "10" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0410"},     
						{ ID_ESQUEMA : "10" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0510"},     
						{ ID_ESQUEMA : "10" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0110"},     
						{ ID_ESQUEMA : "10" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0210"},     
						{ ID_ESQUEMA : "10" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0310"},     
						{ ID_ESQUEMA : "10" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0410"},     
						{ ID_ESQUEMA : "10" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0510"},     
						{ ID_ESQUEMA : "10" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0110"},     
						{ ID_ESQUEMA : "11" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0111"},     
						{ ID_ESQUEMA : "11" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0211"},     
						{ ID_ESQUEMA : "11" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0311"},     
						{ ID_ESQUEMA : "11" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0411"},     
						{ ID_ESQUEMA : "11" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0111"},     
						{ ID_ESQUEMA : "11" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0211"},     
						{ ID_ESQUEMA : "11" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0311"},     
						{ ID_ESQUEMA : "11" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0411"},     
						{ ID_ESQUEMA : "11" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0511"},     
						{ ID_ESQUEMA : "11" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0611"},     
						{ ID_ESQUEMA : "11" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0711"},     
						{ ID_ESQUEMA : "11" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0811"},     
						{ ID_ESQUEMA : "11" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0111"},     
						{ ID_ESQUEMA : "11" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0211"},     
						{ ID_ESQUEMA : "11" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0311"},     
						{ ID_ESQUEMA : "11" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0411"},     
						{ ID_ESQUEMA : "11" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0511"},     
						{ ID_ESQUEMA : "11" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0611"},     
						{ ID_ESQUEMA : "11" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0111"},     
						{ ID_ESQUEMA : "11" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0211"},     
						{ ID_ESQUEMA : "11" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0311"},     
						{ ID_ESQUEMA : "11" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0411"},     
						{ ID_ESQUEMA : "11" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0111"},     
						{ ID_ESQUEMA : "12" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0112"},     
						{ ID_ESQUEMA : "12" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0212"},     
						{ ID_ESQUEMA : "12" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0312"},     
						{ ID_ESQUEMA : "12" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0112"},     
						{ ID_ESQUEMA : "12" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0212"},     
						{ ID_ESQUEMA : "12" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0312"},     
						{ ID_ESQUEMA : "12" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0412"},     
						{ ID_ESQUEMA : "12" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0512"},     
						{ ID_ESQUEMA : "12" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0112"},     
						{ ID_ESQUEMA : "12" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0212"},     
						{ ID_ESQUEMA : "12" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0312"},     
						{ ID_ESQUEMA : "12" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0412"},     
						{ ID_ESQUEMA : "12" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0512"},     
						{ ID_ESQUEMA : "12" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0612"},     
						{ ID_ESQUEMA : "12" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0112"},     
						{ ID_ESQUEMA : "12" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0212"},     
						{ ID_ESQUEMA : "12" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0312"},     
						{ ID_ESQUEMA : "12" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0412"},     
						{ ID_ESQUEMA : "12" , COLOR : "V" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDV0512"},     
						{ ID_ESQUEMA : "12" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0112"},     
						{ ID_ESQUEMA : "13" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0113"},     
						{ ID_ESQUEMA : "13" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0213"},     
						{ ID_ESQUEMA : "13" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0313"},     
						{ ID_ESQUEMA : "13" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0413"},     
						{ ID_ESQUEMA : "13" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0113"},     
						{ ID_ESQUEMA : "13" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0213"},     
						{ ID_ESQUEMA : "13" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0313"},     
						{ ID_ESQUEMA : "13" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0413"},     
						{ ID_ESQUEMA : "13" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0513"},     
						{ ID_ESQUEMA : "13" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0613"},     
						{ ID_ESQUEMA : "13" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0113"},     
						{ ID_ESQUEMA : "13" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0213"},     
						{ ID_ESQUEMA : "13" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0313"},     
						{ ID_ESQUEMA : "13" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0413"},     
						{ ID_ESQUEMA : "13" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0513"},     
						{ ID_ESQUEMA : "13" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0113"},     
						{ ID_ESQUEMA : "13" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0213"},     
						{ ID_ESQUEMA : "13" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0313"},     
						{ ID_ESQUEMA : "13" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0413"},     
						{ ID_ESQUEMA : "13" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0113"},     
						{ ID_ESQUEMA : "14" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0114"},     
						{ ID_ESQUEMA : "14" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0214"},     
						{ ID_ESQUEMA : "14" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0314"},     
						{ ID_ESQUEMA : "14" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0414"},     
						{ ID_ESQUEMA : "14" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0514"},     
						{ ID_ESQUEMA : "14" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0614"},     
						{ ID_ESQUEMA : "14" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0114"},     
						{ ID_ESQUEMA : "14" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0214"},     
						{ ID_ESQUEMA : "14" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0314"},     
						{ ID_ESQUEMA : "14" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0414"},     
						{ ID_ESQUEMA : "14" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0514"},     
						{ ID_ESQUEMA : "14" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0614"},     
						{ ID_ESQUEMA : "14" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0714"},     
						{ ID_ESQUEMA : "14" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0814"},     
						{ ID_ESQUEMA : "14" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0114"},     
						{ ID_ESQUEMA : "14" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0214"},     
						{ ID_ESQUEMA : "14" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0314"},     
						{ ID_ESQUEMA : "14" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0414"},     
						{ ID_ESQUEMA : "14" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0114"},     
						{ ID_ESQUEMA : "14" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0214"},     
						{ ID_ESQUEMA : "14" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0314"},     
						{ ID_ESQUEMA : "14" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0414"},     
						{ ID_ESQUEMA : "14" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0114"},     
						{ ID_ESQUEMA : "15" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0115"},     
						{ ID_ESQUEMA : "15" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0215"},     
						{ ID_ESQUEMA : "15" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0315"},     
						{ ID_ESQUEMA : "15" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0415"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0115"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0215"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0315"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0415"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0515"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0615"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0715"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0815"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0915"},     
						{ ID_ESQUEMA : "15" , COLOR : "N" , ORDEN_PULSADOR : "10" , PREGUNTA : "IDN1015"},     
						{ ID_ESQUEMA : "15" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0115"},     
						{ ID_ESQUEMA : "15" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0215"},     
						{ ID_ESQUEMA : "15" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0315"},     
						{ ID_ESQUEMA : "15" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0415"},     
						{ ID_ESQUEMA : "15" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0515"},     
						{ ID_ESQUEMA : "15" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0115"},     
						{ ID_ESQUEMA : "15" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0215"},     
						{ ID_ESQUEMA : "15" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0315"},     
						{ ID_ESQUEMA : "15" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0415"},     
						{ ID_ESQUEMA : "15" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0115"},     
						{ ID_ESQUEMA : "16" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0116"},     
						{ ID_ESQUEMA : "16" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0216"},     
						{ ID_ESQUEMA : "16" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0316"},     
						{ ID_ESQUEMA : "16" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0416"},     
						{ ID_ESQUEMA : "16" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0516"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0116"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0216"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0316"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0416"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0516"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0616"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0716"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0816"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0916"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "10" , PREGUNTA : "IDN1016"},     
						{ ID_ESQUEMA : "16" , COLOR : "N" , ORDEN_PULSADOR : "11" , PREGUNTA : "IDN1116"},     
						{ ID_ESQUEMA : "16" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0116"},     
						{ ID_ESQUEMA : "16" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0216"},     
						{ ID_ESQUEMA : "16" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0316"},     
						{ ID_ESQUEMA : "16" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0416"},     
						{ ID_ESQUEMA : "16" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0516"},     
						{ ID_ESQUEMA : "16" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0616"},     
						{ ID_ESQUEMA : "16" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0116"},     
						{ ID_ESQUEMA : "16" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0216"},     
						{ ID_ESQUEMA : "16" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0316"},     
						{ ID_ESQUEMA : "16" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0416"},     
						{ ID_ESQUEMA : "16" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0116"},     
						{ ID_ESQUEMA : "17" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0117"},     
						{ ID_ESQUEMA : "17" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0217"},     
						{ ID_ESQUEMA : "17" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0317"},     
						{ ID_ESQUEMA : "17" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0417"},     
						{ ID_ESQUEMA : "17" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0517"},     
						{ ID_ESQUEMA : "17" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0617"},     
						{ ID_ESQUEMA : "17" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0717"},     
						{ ID_ESQUEMA : "17" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0117"},     
						{ ID_ESQUEMA : "17" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0217"},     
						{ ID_ESQUEMA : "17" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0317"},     
						{ ID_ESQUEMA : "17" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0417"},     
						{ ID_ESQUEMA : "17" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0517"},     
						{ ID_ESQUEMA : "17" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0617"},     
						{ ID_ESQUEMA : "17" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0117"},     
						{ ID_ESQUEMA : "17" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0217"},     
						{ ID_ESQUEMA : "17" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0317"},     
						{ ID_ESQUEMA : "17" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0117"},     
						{ ID_ESQUEMA : "17" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0217"},     
						{ ID_ESQUEMA : "17" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0317"},     
						{ ID_ESQUEMA : "17" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0117"},     
						{ ID_ESQUEMA : "18" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0118"},     
						{ ID_ESQUEMA : "18" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0218"},     
						{ ID_ESQUEMA : "18" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0318"},     
						{ ID_ESQUEMA : "18" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0418"},     
						{ ID_ESQUEMA : "18" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0518"},     
						{ ID_ESQUEMA : "18" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0618"},     
						{ ID_ESQUEMA : "18" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0718"},     
						{ ID_ESQUEMA : "18" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0818"},     
						{ ID_ESQUEMA : "18" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0118"},     
						{ ID_ESQUEMA : "18" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0218"},     
						{ ID_ESQUEMA : "18" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0318"},     
						{ ID_ESQUEMA : "18" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0418"},     
						{ ID_ESQUEMA : "18" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0518"},     
						{ ID_ESQUEMA : "18" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0618"},     
						{ ID_ESQUEMA : "18" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0718"},     
						{ ID_ESQUEMA : "18" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0118"},     
						{ ID_ESQUEMA : "18" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0218"},     
						{ ID_ESQUEMA : "18" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0318"},     
						{ ID_ESQUEMA : "18" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0118"},     
						{ ID_ESQUEMA : "18" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0218"},     
						{ ID_ESQUEMA : "18" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0318"},     
						{ ID_ESQUEMA : "18" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0118"},     
						{ ID_ESQUEMA : "19" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0119"},     
						{ ID_ESQUEMA : "19" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0219"},     
						{ ID_ESQUEMA : "19" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0319"},     
						{ ID_ESQUEMA : "19" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0419"},     
						{ ID_ESQUEMA : "19" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0119"},     
						{ ID_ESQUEMA : "19" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0219"},     
						{ ID_ESQUEMA : "19" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0319"},     
						{ ID_ESQUEMA : "19" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0419"},     
						{ ID_ESQUEMA : "19" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0519"},     
						{ ID_ESQUEMA : "19" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0619"},     
						{ ID_ESQUEMA : "19" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0119"},     
						{ ID_ESQUEMA : "19" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0219"},     
						{ ID_ESQUEMA : "19" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0319"},     
						{ ID_ESQUEMA : "19" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0119"},     
						{ ID_ESQUEMA : "19" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0219"},     
						{ ID_ESQUEMA : "19" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0119"},     
						{ ID_ESQUEMA : "20" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0120"},     
						{ ID_ESQUEMA : "20" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0220"},     
						{ ID_ESQUEMA : "20" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0320"},     
						{ ID_ESQUEMA : "20" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0420"},     
						{ ID_ESQUEMA : "20" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0520"},     
						{ ID_ESQUEMA : "20" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0620"},     
						{ ID_ESQUEMA : "20" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0720"},     
						{ ID_ESQUEMA : "20" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0120"},     
						{ ID_ESQUEMA : "20" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0220"},     
						{ ID_ESQUEMA : "20" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0320"},     
						{ ID_ESQUEMA : "20" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0420"},     
						{ ID_ESQUEMA : "20" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0520"},     
						{ ID_ESQUEMA : "20" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0120"},     
						{ ID_ESQUEMA : "20" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0220"},     
						{ ID_ESQUEMA : "20" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0320"},     
						{ ID_ESQUEMA : "20" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0120"},     
						{ ID_ESQUEMA : "20" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0220"},     
						{ ID_ESQUEMA : "20" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0120"},     
						{ ID_ESQUEMA : "21" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0121"},     
						{ ID_ESQUEMA : "21" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0221"},     
						{ ID_ESQUEMA : "21" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0321"},     
						{ ID_ESQUEMA : "21" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0421"},     
						{ ID_ESQUEMA : "21" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0121"},     
						{ ID_ESQUEMA : "21" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0221"},     
						{ ID_ESQUEMA : "21" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0321"},     
						{ ID_ESQUEMA : "21" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0421"},     
						{ ID_ESQUEMA : "21" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0521"},     
						{ ID_ESQUEMA : "21" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0621"},     
						{ ID_ESQUEMA : "21" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0121"},     
						{ ID_ESQUEMA : "21" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0221"},     
						{ ID_ESQUEMA : "21" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0321"},     
						{ ID_ESQUEMA : "21" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0421"},     
						{ ID_ESQUEMA : "21" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0521"},     
						{ ID_ESQUEMA : "21" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0621"},     
						{ ID_ESQUEMA : "21" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0121"},     
						{ ID_ESQUEMA : "21" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0221"},     
						{ ID_ESQUEMA : "21" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0321"},     
						{ ID_ESQUEMA : "21" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0121"},     
						{ ID_ESQUEMA : "22" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0122"},     
						{ ID_ESQUEMA : "22" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0222"},     
						{ ID_ESQUEMA : "22" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0322"},     
						{ ID_ESQUEMA : "22" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0422"},     
						{ ID_ESQUEMA : "22" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0522"},     
						{ ID_ESQUEMA : "22" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0122"},     
						{ ID_ESQUEMA : "22" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0222"},     
						{ ID_ESQUEMA : "22" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0322"},     
						{ ID_ESQUEMA : "22" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0422"},     
						{ ID_ESQUEMA : "22" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0522"},     
						{ ID_ESQUEMA : "22" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0122"},     
						{ ID_ESQUEMA : "22" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0222"},     
						{ ID_ESQUEMA : "22" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0322"},     
						{ ID_ESQUEMA : "22" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0122"},     
						{ ID_ESQUEMA : "22" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0222"},     
						{ ID_ESQUEMA : "22" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0322"},     
						{ ID_ESQUEMA : "22" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0422"},     
						{ ID_ESQUEMA : "22" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0122"},     
						{ ID_ESQUEMA : "23" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0123"},     
						{ ID_ESQUEMA : "23" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0223"},     
						{ ID_ESQUEMA : "23" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0323"},     
						{ ID_ESQUEMA : "23" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0423"},     
						{ ID_ESQUEMA : "23" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0523"},     
						{ ID_ESQUEMA : "23" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0123"},     
						{ ID_ESQUEMA : "23" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0223"},     
						{ ID_ESQUEMA : "23" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0323"},     
						{ ID_ESQUEMA : "23" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0423"},     
						{ ID_ESQUEMA : "23" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0523"},     
						{ ID_ESQUEMA : "23" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0123"},     
						{ ID_ESQUEMA : "23" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0223"},     
						{ ID_ESQUEMA : "23" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0323"},     
						{ ID_ESQUEMA : "23" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0123"},     
						{ ID_ESQUEMA : "23" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0223"},     
						{ ID_ESQUEMA : "23" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0323"},     
						{ ID_ESQUEMA : "23" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0123"},     
						{ ID_ESQUEMA : "24" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0124"},     
						{ ID_ESQUEMA : "24" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0224"},     
						{ ID_ESQUEMA : "24" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0324"},     
						{ ID_ESQUEMA : "24" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0424"},     
						{ ID_ESQUEMA : "24" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0524"},     
						{ ID_ESQUEMA : "24" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0624"},     
						{ ID_ESQUEMA : "24" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0724"},     
						{ ID_ESQUEMA : "24" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0124"},     
						{ ID_ESQUEMA : "24" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0224"},     
						{ ID_ESQUEMA : "24" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0324"},     
						{ ID_ESQUEMA : "24" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0424"},     
						{ ID_ESQUEMA : "24" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0524"},     
						{ ID_ESQUEMA : "24" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0624"},     
						{ ID_ESQUEMA : "24" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0724"},     
						{ ID_ESQUEMA : "24" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0124"},     
						{ ID_ESQUEMA : "24" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0224"},     
						{ ID_ESQUEMA : "24" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0324"},     
						{ ID_ESQUEMA : "24" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0424"},     
						{ ID_ESQUEMA : "24" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0524"},     
						{ ID_ESQUEMA : "24" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0624"},     
						{ ID_ESQUEMA : "24" , COLOR : "R" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDR0724"},     
						{ ID_ESQUEMA : "24" , COLOR : "R" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDR0824"},     
						{ ID_ESQUEMA : "24" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0124"},     
						{ ID_ESQUEMA : "24" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0224"},     
						{ ID_ESQUEMA : "24" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0124"},     
						{ ID_ESQUEMA : "25" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0125"},     
						{ ID_ESQUEMA : "26" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0126"},     
						{ ID_ESQUEMA : "26" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0226"},     
						{ ID_ESQUEMA : "26" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0326"},     
						{ ID_ESQUEMA : "26" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0426"},     
						{ ID_ESQUEMA : "26" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0526"},     
						{ ID_ESQUEMA : "26" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0126"},     
						{ ID_ESQUEMA : "26" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0226"},     
						{ ID_ESQUEMA : "26" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0326"},     
						{ ID_ESQUEMA : "26" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0126"},     
						{ ID_ESQUEMA : "26" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0226"},     
						{ ID_ESQUEMA : "26" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0326"},     
						{ ID_ESQUEMA : "26" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0426"},     
						{ ID_ESQUEMA : "26" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0126"},     
						{ ID_ESQUEMA : "27" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0127"},     
						{ ID_ESQUEMA : "27" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0227"},     
						{ ID_ESQUEMA : "27" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0327"},     
						{ ID_ESQUEMA : "27" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0427"},     
						{ ID_ESQUEMA : "27" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0527"},     
						{ ID_ESQUEMA : "27" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0627"},     
						{ ID_ESQUEMA : "27" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0127"},     
						{ ID_ESQUEMA : "27" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0227"},     
						{ ID_ESQUEMA : "27" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0327"},     
						{ ID_ESQUEMA : "27" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0427"},     
						{ ID_ESQUEMA : "27" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0527"},     
						{ ID_ESQUEMA : "27" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0627"},     
						{ ID_ESQUEMA : "27" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0127"},     
						{ ID_ESQUEMA : "27" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0227"},     
						{ ID_ESQUEMA : "27" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0327"},     
						{ ID_ESQUEMA : "27" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0127"},     
						{ ID_ESQUEMA : "27" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0227"},     
						{ ID_ESQUEMA : "27" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0327"},     
						{ ID_ESQUEMA : "27" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0427"},     
						{ ID_ESQUEMA : "27" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0127"},     
						{ ID_ESQUEMA : "28" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0128"},     
						{ ID_ESQUEMA : "28" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0228"},     
						{ ID_ESQUEMA : "28" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0328"},     
						{ ID_ESQUEMA : "28" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0428"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0128"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0228"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0328"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0428"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0528"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0628"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0728"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0828"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0928"},     
						{ ID_ESQUEMA : "28" , COLOR : "N" , ORDEN_PULSADOR : "10" , PREGUNTA : "IDN1028"},     
						{ ID_ESQUEMA : "28" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0128"},     
						{ ID_ESQUEMA : "28" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0228"},     
						{ ID_ESQUEMA : "28" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0328"},     
						{ ID_ESQUEMA : "28" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0428"},     
						{ ID_ESQUEMA : "28" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0528"},     
						{ ID_ESQUEMA : "28" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0128"},     
						{ ID_ESQUEMA : "28" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0228"},     
						{ ID_ESQUEMA : "28" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0328"},     
						{ ID_ESQUEMA : "28" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0128"},     
						{ ID_ESQUEMA : "29" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0129"},     
						{ ID_ESQUEMA : "29" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0229"},     
						{ ID_ESQUEMA : "29" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0329"},     
						{ ID_ESQUEMA : "29" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0429"},     
						{ ID_ESQUEMA : "29" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0529"},     
						{ ID_ESQUEMA : "29" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0129"},     
						{ ID_ESQUEMA : "29" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0229"},     
						{ ID_ESQUEMA : "29" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0329"},     
						{ ID_ESQUEMA : "29" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0429"},     
						{ ID_ESQUEMA : "29" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0529"},     
						{ ID_ESQUEMA : "29" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0629"},     
						{ ID_ESQUEMA : "29" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0729"},     
						{ ID_ESQUEMA : "29" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0829"},     
						{ ID_ESQUEMA : "29" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0129"},     
						{ ID_ESQUEMA : "29" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0229"},     
						{ ID_ESQUEMA : "29" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0329"},     
						{ ID_ESQUEMA : "29" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0429"},     
						{ ID_ESQUEMA : "29" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0529"},     
						{ ID_ESQUEMA : "29" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0629"},     
						{ ID_ESQUEMA : "29" , COLOR : "R" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDR0729"},     
						{ ID_ESQUEMA : "29" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0129"},     
						{ ID_ESQUEMA : "29" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0229"},     
						{ ID_ESQUEMA : "30" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0130"},     
						{ ID_ESQUEMA : "30" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0230"},     
						{ ID_ESQUEMA : "30" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0330"},     
						{ ID_ESQUEMA : "30" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0430"},     
						{ ID_ESQUEMA : "30" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0530"},     
						{ ID_ESQUEMA : "30" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0130"},     
						{ ID_ESQUEMA : "30" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0230"},     
						{ ID_ESQUEMA : "30" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0330"},     
						{ ID_ESQUEMA : "30" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0430"},     
						{ ID_ESQUEMA : "30" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0530"},     
						{ ID_ESQUEMA : "30" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0130"},     
						{ ID_ESQUEMA : "30" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0230"},     
						{ ID_ESQUEMA : "30" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0330"},     
						{ ID_ESQUEMA : "30" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0430"},     
						{ ID_ESQUEMA : "30" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0530"},     
						{ ID_ESQUEMA : "30" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0130"},     
						{ ID_ESQUEMA : "30" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0230"},     
						{ ID_ESQUEMA : "30" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0330"},     
						{ ID_ESQUEMA : "30" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0130"},     
						{ ID_ESQUEMA : "31" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0131"},     
						{ ID_ESQUEMA : "31" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0231"},     
						{ ID_ESQUEMA : "31" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0331"},     
						{ ID_ESQUEMA : "31" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0431"},     
						{ ID_ESQUEMA : "31" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0531"},     
						{ ID_ESQUEMA : "31" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0631"},     
						{ ID_ESQUEMA : "31" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0731"},     
						{ ID_ESQUEMA : "31" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0131"},     
						{ ID_ESQUEMA : "31" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0231"},     
						{ ID_ESQUEMA : "31" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0331"},     
						{ ID_ESQUEMA : "31" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0431"},     
						{ ID_ESQUEMA : "31" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0531"},     
						{ ID_ESQUEMA : "31" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0131"},     
						{ ID_ESQUEMA : "31" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0231"},     
						{ ID_ESQUEMA : "31" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0331"},     
						{ ID_ESQUEMA : "31" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0431"},     
						{ ID_ESQUEMA : "31" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0531"},     
						{ ID_ESQUEMA : "31" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0131"},     
						{ ID_ESQUEMA : "31" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0231"},     
						{ ID_ESQUEMA : "31" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0131"},     
						{ ID_ESQUEMA : "32" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0132"},     
						{ ID_ESQUEMA : "32" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0232"},     
						{ ID_ESQUEMA : "32" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0332"},     
						{ ID_ESQUEMA : "32" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0432"},     
						{ ID_ESQUEMA : "32" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0532"},     
						{ ID_ESQUEMA : "32" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0632"},     
						{ ID_ESQUEMA : "32" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0132"},     
						{ ID_ESQUEMA : "32" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0232"},     
						{ ID_ESQUEMA : "32" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0332"},     
						{ ID_ESQUEMA : "32" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0432"},     
						{ ID_ESQUEMA : "32" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0532"},     
						{ ID_ESQUEMA : "32" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0632"},     
						{ ID_ESQUEMA : "32" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0132"},     
						{ ID_ESQUEMA : "32" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0232"},     
						{ ID_ESQUEMA : "32" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0332"},     
						{ ID_ESQUEMA : "32" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0432"},     
						{ ID_ESQUEMA : "32" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0132"},     
						{ ID_ESQUEMA : "32" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0232"},     
						{ ID_ESQUEMA : "32" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0332"},     
						{ ID_ESQUEMA : "32" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0432"},     
						{ ID_ESQUEMA : "32" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0132"},     
						{ ID_ESQUEMA : "33" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0133"},     
						{ ID_ESQUEMA : "33" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0233"},     
						{ ID_ESQUEMA : "33" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0333"},     
						{ ID_ESQUEMA : "33" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0433"},     
						{ ID_ESQUEMA : "33" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0133"},     
						{ ID_ESQUEMA : "33" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0233"},     
						{ ID_ESQUEMA : "33" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0333"},     
						{ ID_ESQUEMA : "33" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0433"},     
						{ ID_ESQUEMA : "33" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0533"},     
						{ ID_ESQUEMA : "33" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0133"},     
						{ ID_ESQUEMA : "33" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0233"},     
						{ ID_ESQUEMA : "33" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0333"},     
						{ ID_ESQUEMA : "33" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0133"},     
						{ ID_ESQUEMA : "33" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0233"},     
						{ ID_ESQUEMA : "33" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0333"},     
						{ ID_ESQUEMA : "33" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0133"},     
						{ ID_ESQUEMA : "34" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0134"},     
						{ ID_ESQUEMA : "34" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0234"},     
						{ ID_ESQUEMA : "34" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0334"},     
						{ ID_ESQUEMA : "34" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0434"},     
						{ ID_ESQUEMA : "34" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0134"},     
						{ ID_ESQUEMA : "34" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0234"},     
						{ ID_ESQUEMA : "34" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0334"},     
						{ ID_ESQUEMA : "34" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0434"},     
						{ ID_ESQUEMA : "34" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0534"},     
						{ ID_ESQUEMA : "34" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0634"},     
						{ ID_ESQUEMA : "34" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0134"},     
						{ ID_ESQUEMA : "34" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0234"},     
						{ ID_ESQUEMA : "34" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0334"},     
						{ ID_ESQUEMA : "34" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0434"},     
						{ ID_ESQUEMA : "34" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0535"},     
						{ ID_ESQUEMA : "34" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0134"},     
						{ ID_ESQUEMA : "34" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0234"},     
						{ ID_ESQUEMA : "34" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0334"},     
						{ ID_ESQUEMA : "34" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0434"},     
						{ ID_ESQUEMA : "34" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0134"},     
						{ ID_ESQUEMA : "35" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0135"},     
						{ ID_ESQUEMA : "35" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0235"},     
						{ ID_ESQUEMA : "35" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0335"},     
						{ ID_ESQUEMA : "35" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0435"},     
						{ ID_ESQUEMA : "35" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0535"},     
						{ ID_ESQUEMA : "35" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0635"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0135"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0235"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0335"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0435"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0535"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0635"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0735"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0835"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0935"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "10" , PREGUNTA : "IDN1035"},     
						{ ID_ESQUEMA : "35" , COLOR : "N" , ORDEN_PULSADOR : "11" , PREGUNTA : "IDN1135"},     
						{ ID_ESQUEMA : "35" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0135"},     
						{ ID_ESQUEMA : "35" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0235"},     
						{ ID_ESQUEMA : "35" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0335"},     
						{ ID_ESQUEMA : "35" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0435"},     
						{ ID_ESQUEMA : "35" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0535"},     
						{ ID_ESQUEMA : "35" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0635"},     
						{ ID_ESQUEMA : "35" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0135"},     
						{ ID_ESQUEMA : "35" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0235"},     
						{ ID_ESQUEMA : "35" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0335"},     
						{ ID_ESQUEMA : "35" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0435"},     
						{ ID_ESQUEMA : "35" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0135"},     
						{ ID_ESQUEMA : "36" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0136"},     
						{ ID_ESQUEMA : "36" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0236"},     
						{ ID_ESQUEMA : "36" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0336"},     
						{ ID_ESQUEMA : "36" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0436"},     
						{ ID_ESQUEMA : "36" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0536"},     
						{ ID_ESQUEMA : "36" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0636"},     
						{ ID_ESQUEMA : "36" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0136"},     
						{ ID_ESQUEMA : "36" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0236"},     
						{ ID_ESQUEMA : "36" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0336"},     
						{ ID_ESQUEMA : "36" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0436"},     
						{ ID_ESQUEMA : "36" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0536"},     
						{ ID_ESQUEMA : "36" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0636"},     
						{ ID_ESQUEMA : "36" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0136"},     
						{ ID_ESQUEMA : "36" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0236"},     
						{ ID_ESQUEMA : "36" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0336"},     
						{ ID_ESQUEMA : "36" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0136"},     
						{ ID_ESQUEMA : "36" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0236"},     
						{ ID_ESQUEMA : "36" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0336"},     
						{ ID_ESQUEMA : "36" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0436"},     
						{ ID_ESQUEMA : "36" , COLOR : "V" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDV0536"},     
						{ ID_ESQUEMA : "36" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0136"},     
						{ ID_ESQUEMA : "37" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0137"},     
						{ ID_ESQUEMA : "37" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0237"},     
						{ ID_ESQUEMA : "37" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0337"},     
						{ ID_ESQUEMA : "37" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0437"},     
						{ ID_ESQUEMA : "37" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0537"},     
						{ ID_ESQUEMA : "37" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0637"},     
						{ ID_ESQUEMA : "37" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0737"},     
						{ ID_ESQUEMA : "37" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0837"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0137"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0237"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0337"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0437"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0537"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0637"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0737"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0837"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0937"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "10" , PREGUNTA : "IDN1037"},     
						{ ID_ESQUEMA : "37" , COLOR : "N" , ORDEN_PULSADOR : "11" , PREGUNTA : "IDN1137"},     
						{ ID_ESQUEMA : "37" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0137"},     
						{ ID_ESQUEMA : "37" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0237"},     
						{ ID_ESQUEMA : "37" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0337"},     
						{ ID_ESQUEMA : "37" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0437"},     
						{ ID_ESQUEMA : "37" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0537"},     
						{ ID_ESQUEMA : "37" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0637"},     
						{ ID_ESQUEMA : "37" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0137"},     
						{ ID_ESQUEMA : "37" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0237"},     
						{ ID_ESQUEMA : "37" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0337"},     
						{ ID_ESQUEMA : "37" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0437"},     
						{ ID_ESQUEMA : "37" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0137"},     
						{ ID_ESQUEMA : "38" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0138"},     
						{ ID_ESQUEMA : "38" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0238"},     
						{ ID_ESQUEMA : "38" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0338"},     
						{ ID_ESQUEMA : "38" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0438"},     
						{ ID_ESQUEMA : "38" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0538"},     
						{ ID_ESQUEMA : "38" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0638"},     
						{ ID_ESQUEMA : "38" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0738"},     
						{ ID_ESQUEMA : "38" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0138"},     
						{ ID_ESQUEMA : "38" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0238"},     
						{ ID_ESQUEMA : "38" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0338"},     
						{ ID_ESQUEMA : "38" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0438"},     
						{ ID_ESQUEMA : "38" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0538"},     
						{ ID_ESQUEMA : "38" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0638"},     
						{ ID_ESQUEMA : "38" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0738"},     
						{ ID_ESQUEMA : "38" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0838"},     
						{ ID_ESQUEMA : "38" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0138"},     
						{ ID_ESQUEMA : "38" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0238"},     
						{ ID_ESQUEMA : "38" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0338"},     
						{ ID_ESQUEMA : "38" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0438"},     
						{ ID_ESQUEMA : "38" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0538"},     
						{ ID_ESQUEMA : "38" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0138"},     
						{ ID_ESQUEMA : "38" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0238"},     
						{ ID_ESQUEMA : "38" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0338"},     
						{ ID_ESQUEMA : "38" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0438"},     
						{ ID_ESQUEMA : "38" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0138"},     
						{ ID_ESQUEMA : "39" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0139"},     
						{ ID_ESQUEMA : "39" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0239"},     
						{ ID_ESQUEMA : "39" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0339"},     
						{ ID_ESQUEMA : "39" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0439"},     
						{ ID_ESQUEMA : "39" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0539"},     
						{ ID_ESQUEMA : "39" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0639"},     
						{ ID_ESQUEMA : "39" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0739"},     
						{ ID_ESQUEMA : "39" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0839"},     
						{ ID_ESQUEMA : "39" , COLOR : "M" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDM0939"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0139"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0239"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0339"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0439"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0539"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0639"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0739"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0839"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0939"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "10" , PREGUNTA : "IDN1039"},     
						{ ID_ESQUEMA : "39" , COLOR : "N" , ORDEN_PULSADOR : "11" , PREGUNTA : "IDN1139"},     
						{ ID_ESQUEMA : "39" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0139"},     
						{ ID_ESQUEMA : "39" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0239"},     
						{ ID_ESQUEMA : "39" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0339"},     
						{ ID_ESQUEMA : "39" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0439"},     
						{ ID_ESQUEMA : "39" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0139"},     
						{ ID_ESQUEMA : "39" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0239"},     
						{ ID_ESQUEMA : "39" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0339"},     
						{ ID_ESQUEMA : "39" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0439"},     
						{ ID_ESQUEMA : "39" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0139"},     
						{ ID_ESQUEMA : "40" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0140"},     
						{ ID_ESQUEMA : "40" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0240"},     
						{ ID_ESQUEMA : "40" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0340"},     
						{ ID_ESQUEMA : "40" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0440"},     
						{ ID_ESQUEMA : "40" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0140"},     
						{ ID_ESQUEMA : "40" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0240"},     
						{ ID_ESQUEMA : "40" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0340"},     
						{ ID_ESQUEMA : "40" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0440"},     
						{ ID_ESQUEMA : "40" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0540"},     
						{ ID_ESQUEMA : "40" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0640"},     
						{ ID_ESQUEMA : "40" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0140"},     
						{ ID_ESQUEMA : "40" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0240"},     
						{ ID_ESQUEMA : "40" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0340"},     
						{ ID_ESQUEMA : "40" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0440"},     
						{ ID_ESQUEMA : "40" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0540"},     
						{ ID_ESQUEMA : "40" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0140"},     
						{ ID_ESQUEMA : "41" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0141"},     
						{ ID_ESQUEMA : "41" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0241"},     
						{ ID_ESQUEMA : "41" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0341"},     
						{ ID_ESQUEMA : "41" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0441"},     
						{ ID_ESQUEMA : "41" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0541"},     
						{ ID_ESQUEMA : "41" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0641"},     
						{ ID_ESQUEMA : "41" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0741"},     
						{ ID_ESQUEMA : "41" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0841"},     
						{ ID_ESQUEMA : "41" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0141"},     
						{ ID_ESQUEMA : "41" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0241"},     
						{ ID_ESQUEMA : "41" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0341"},     
						{ ID_ESQUEMA : "41" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0441"},     
						{ ID_ESQUEMA : "41" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0541"},     
						{ ID_ESQUEMA : "41" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0641"},     
						{ ID_ESQUEMA : "41" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0141"},     
						{ ID_ESQUEMA : "41" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0241"},     
						{ ID_ESQUEMA : "41" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0341"},     
						{ ID_ESQUEMA : "41" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0441"},     
						{ ID_ESQUEMA : "41" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0141"},     
						{ ID_ESQUEMA : "41" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0241"},     
						{ ID_ESQUEMA : "41" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0341"},     
						{ ID_ESQUEMA : "41" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0441"},     
						{ ID_ESQUEMA : "41" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0141"},     
						{ ID_ESQUEMA : "42" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0142"},     
						{ ID_ESQUEMA : "42" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0242"},     
						{ ID_ESQUEMA : "42" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0342"},     
						{ ID_ESQUEMA : "42" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0442"},     
						{ ID_ESQUEMA : "42" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0542"},     
						{ ID_ESQUEMA : "42" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0642"},     
						{ ID_ESQUEMA : "42" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0142"},     
						{ ID_ESQUEMA : "42" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0242"},     
						{ ID_ESQUEMA : "42" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0342"},     
						{ ID_ESQUEMA : "42" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0442"},     
						{ ID_ESQUEMA : "42" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0542"},     
						{ ID_ESQUEMA : "42" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0142"},     
						{ ID_ESQUEMA : "42" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0242"},     
						{ ID_ESQUEMA : "42" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0342"},     
						{ ID_ESQUEMA : "42" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0442"},     
						{ ID_ESQUEMA : "42" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0142"},     
						{ ID_ESQUEMA : "42" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0242"},     
						{ ID_ESQUEMA : "42" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0342"},     
						{ ID_ESQUEMA : "42" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0442"},     
						{ ID_ESQUEMA : "42" , COLOR : "V" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDV0542"},     
						{ ID_ESQUEMA : "42" , COLOR : "V" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDV0642"},     
						{ ID_ESQUEMA : "42" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0142"},     
						{ ID_ESQUEMA : "43" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0143"},     
						{ ID_ESQUEMA : "43" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0243"},     
						{ ID_ESQUEMA : "43" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0343"},     
						{ ID_ESQUEMA : "43" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0443"},     
						{ ID_ESQUEMA : "43" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0543"},     
						{ ID_ESQUEMA : "43" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0143"},     
						{ ID_ESQUEMA : "43" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0243"},     
						{ ID_ESQUEMA : "43" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0343"},     
						{ ID_ESQUEMA : "43" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0143"},     
						{ ID_ESQUEMA : "43" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0243"},     
						{ ID_ESQUEMA : "43" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0343"},     
						{ ID_ESQUEMA : "43" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0143"},     
						{ ID_ESQUEMA : "43" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0243"},     
						{ ID_ESQUEMA : "43" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0343"},     
						{ ID_ESQUEMA : "43" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0443"},     
						{ ID_ESQUEMA : "43" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0143"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0144"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0244"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0344"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0444"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0544"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0644"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0744"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0844"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDM0944"},     
						{ ID_ESQUEMA : "44" , COLOR : "M" , ORDEN_PULSADOR : "10" , PREGUNTA : "IDM1044"},     
						{ ID_ESQUEMA : "44" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0144"},     
						{ ID_ESQUEMA : "44" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0244"},     
						{ ID_ESQUEMA : "44" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0344"},     
						{ ID_ESQUEMA : "44" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0444"},     
						{ ID_ESQUEMA : "44" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0544"},     
						{ ID_ESQUEMA : "44" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0644"},     
						{ ID_ESQUEMA : "44" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0144"},     
						{ ID_ESQUEMA : "44" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0244"},     
						{ ID_ESQUEMA : "44" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0344"},     
						{ ID_ESQUEMA : "44" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0444"},     
						{ ID_ESQUEMA : "44" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0544"},     
						{ ID_ESQUEMA : "44" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0144"},     
						{ ID_ESQUEMA : "44" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0244"},     
						{ ID_ESQUEMA : "44" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0344"},     
						{ ID_ESQUEMA : "44" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0444"},     
						{ ID_ESQUEMA : "44" , COLOR : "V" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDV0544"},     
						{ ID_ESQUEMA : "44" , COLOR : "V" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDV0644"},     
						{ ID_ESQUEMA : "44" , COLOR : "V" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDV0744"},     
						{ ID_ESQUEMA : "44" , COLOR : "V" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDV0844"},     
						{ ID_ESQUEMA : "44" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0144"},     
						{ ID_ESQUEMA : "45" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0145"},     
						{ ID_ESQUEMA : "45" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0245"},     
						{ ID_ESQUEMA : "45" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0345"},     
						{ ID_ESQUEMA : "45" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0445"},     
						{ ID_ESQUEMA : "45" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0145"},     
						{ ID_ESQUEMA : "45" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0245"},     
						{ ID_ESQUEMA : "45" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0345"},     
						{ ID_ESQUEMA : "45" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0445"},     
						{ ID_ESQUEMA : "45" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0545"},     
						{ ID_ESQUEMA : "45" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0145"},     
						{ ID_ESQUEMA : "45" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0145"},     
						{ ID_ESQUEMA : "45" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0245"},     
						{ ID_ESQUEMA : "45" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0345"},     
						{ ID_ESQUEMA : "45" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0445"},     
						{ ID_ESQUEMA : "45" , COLOR : "V" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDV0545"},     
						{ ID_ESQUEMA : "45" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0145"},     
						{ ID_ESQUEMA : "46" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0146"},     
						{ ID_ESQUEMA : "46" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0246"},     
						{ ID_ESQUEMA : "46" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0346"},     
						{ ID_ESQUEMA : "46" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0446"},     
						{ ID_ESQUEMA : "46" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0546"},     
						{ ID_ESQUEMA : "46" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0646"},     
						{ ID_ESQUEMA : "46" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0146"},     
						{ ID_ESQUEMA : "46" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0246"},     
						{ ID_ESQUEMA : "46" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0346"},     
						{ ID_ESQUEMA : "46" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0446"},     
						{ ID_ESQUEMA : "46" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0546"},     
						{ ID_ESQUEMA : "46" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0146"},     
						{ ID_ESQUEMA : "46" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0246"},     
						{ ID_ESQUEMA : "46" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0346"},     
						{ ID_ESQUEMA : "46" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0446"},     
						{ ID_ESQUEMA : "46" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0146"},     
						{ ID_ESQUEMA : "46" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0246"},     
						{ ID_ESQUEMA : "46" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0346"},     
						{ ID_ESQUEMA : "46" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0446"},     
						{ ID_ESQUEMA : "46" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0146"},     
						{ ID_ESQUEMA : "47" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0147"},     
						{ ID_ESQUEMA : "47" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0247"},     
						{ ID_ESQUEMA : "47" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0347"},     
						{ ID_ESQUEMA : "47" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0447"},     
						{ ID_ESQUEMA : "47" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0547"},     
						{ ID_ESQUEMA : "47" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0647"},     
						{ ID_ESQUEMA : "47" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0147"},     
						{ ID_ESQUEMA : "47" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0247"},     
						{ ID_ESQUEMA : "47" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0347"},     
						{ ID_ESQUEMA : "47" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0447"},     
						{ ID_ESQUEMA : "47" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0547"},     
						{ ID_ESQUEMA : "47" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0647"},     
						{ ID_ESQUEMA : "47" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0747"},     
						{ ID_ESQUEMA : "47" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0847"},     
						{ ID_ESQUEMA : "47" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0147"},     
						{ ID_ESQUEMA : "47" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0247"},     
						{ ID_ESQUEMA : "47" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0347"},     
						{ ID_ESQUEMA : "47" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0447"},     
						{ ID_ESQUEMA : "47" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0547"},     
						{ ID_ESQUEMA : "47" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0147"},     
						{ ID_ESQUEMA : "47" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0247"},     
						{ ID_ESQUEMA : "47" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0347"},     
						{ ID_ESQUEMA : "47" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0447"},     
						{ ID_ESQUEMA : "47" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0147"},     
						{ ID_ESQUEMA : "48" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0148"},     
						{ ID_ESQUEMA : "48" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0248"},     
						{ ID_ESQUEMA : "48" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0348"},     
						{ ID_ESQUEMA : "48" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0448"},     
						{ ID_ESQUEMA : "48" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0548"},     
						{ ID_ESQUEMA : "48" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0648"},     
						{ ID_ESQUEMA : "48" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0148"},     
						{ ID_ESQUEMA : "48" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0248"},     
						{ ID_ESQUEMA : "48" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0348"},     
						{ ID_ESQUEMA : "48" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0448"},     
						{ ID_ESQUEMA : "48" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0548"},     
						{ ID_ESQUEMA : "48" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0148"},     
						{ ID_ESQUEMA : "48" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0248"},     
						{ ID_ESQUEMA : "48" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0348"},     
						{ ID_ESQUEMA : "48" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0448"},     
						{ ID_ESQUEMA : "48" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0548"},     
						{ ID_ESQUEMA : "48" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0648"},     
						{ ID_ESQUEMA : "48" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0148"},     
						{ ID_ESQUEMA : "49" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0149"},     
						{ ID_ESQUEMA : "49" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0249"},     
						{ ID_ESQUEMA : "49" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0349"},     
						{ ID_ESQUEMA : "49" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0449"},     
						{ ID_ESQUEMA : "49" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0549"},     
						{ ID_ESQUEMA : "49" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0649"},     
						{ ID_ESQUEMA : "49" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0749"},     
						{ ID_ESQUEMA : "49" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0149"},     
						{ ID_ESQUEMA : "49" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0249"},     
						{ ID_ESQUEMA : "49" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0349"},     
						{ ID_ESQUEMA : "49" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0449"},     
						{ ID_ESQUEMA : "49" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0549"},     
						{ ID_ESQUEMA : "49" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0149"},     
						{ ID_ESQUEMA : "49" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0249"},     
						{ ID_ESQUEMA : "49" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0349"},     
						{ ID_ESQUEMA : "49" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0449"},     
						{ ID_ESQUEMA : "49" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0549"},     
						{ ID_ESQUEMA : "49" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0649"},     
						{ ID_ESQUEMA : "49" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0149"},     
						{ ID_ESQUEMA : "49" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0249"},     
						{ ID_ESQUEMA : "49" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0349"},     
						{ ID_ESQUEMA : "49" , COLOR : "V" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDV0449"},     
						{ ID_ESQUEMA : "49" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0149"},     
						{ ID_ESQUEMA : "50" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0150"},     
						{ ID_ESQUEMA : "50" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0250"},     
						{ ID_ESQUEMA : "50" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0350"},     
						{ ID_ESQUEMA : "50" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0450"},     
						{ ID_ESQUEMA : "50" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0150"},     
						{ ID_ESQUEMA : "50" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0250"},     
						{ ID_ESQUEMA : "50" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0350"},     
						{ ID_ESQUEMA : "50" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0450"},     
						{ ID_ESQUEMA : "50" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0550"},     
						{ ID_ESQUEMA : "50" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0650"},     
						{ ID_ESQUEMA : "50" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0150"},     
						{ ID_ESQUEMA : "50" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0250"},     
						{ ID_ESQUEMA : "50" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0350"},     
						{ ID_ESQUEMA : "50" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0150"},     
						{ ID_ESQUEMA : "50" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0150"},     
						{ ID_ESQUEMA : "51" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0151"},     
						{ ID_ESQUEMA : "51" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0251"},     
						{ ID_ESQUEMA : "51" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0351"},     
						{ ID_ESQUEMA : "51" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0151"},     
						{ ID_ESQUEMA : "51" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0251"},     
						{ ID_ESQUEMA : "51" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0351"},     
						{ ID_ESQUEMA : "51" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0451"},     
						{ ID_ESQUEMA : "51" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0551"},     
						{ ID_ESQUEMA : "51" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0651"},     
						{ ID_ESQUEMA : "51" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0751"},     
						{ ID_ESQUEMA : "51" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0851"},     
						{ ID_ESQUEMA : "51" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0151"},     
						{ ID_ESQUEMA : "51" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0251"},     
						{ ID_ESQUEMA : "51" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0351"},     
						{ ID_ESQUEMA : "51" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0451"},     
						{ ID_ESQUEMA : "51" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0551"},     
						{ ID_ESQUEMA : "51" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0151"},     
						{ ID_ESQUEMA : "51" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0251"},     
						{ ID_ESQUEMA : "51" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0151"},     
						{ ID_ESQUEMA : "52" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0152"},     
						{ ID_ESQUEMA : "52" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0252"},     
						{ ID_ESQUEMA : "52" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0352"},     
						{ ID_ESQUEMA : "52" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0452"},     
						{ ID_ESQUEMA : "52" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0552"},     
						{ ID_ESQUEMA : "52" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0652"},     
						{ ID_ESQUEMA : "52" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0752"},     
						{ ID_ESQUEMA : "52" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0852"},     
						{ ID_ESQUEMA : "52" , COLOR : "M" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDM0952"},     
						{ ID_ESQUEMA : "52" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0152"},     
						{ ID_ESQUEMA : "52" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0252"},     
						{ ID_ESQUEMA : "52" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0352"},     
						{ ID_ESQUEMA : "52" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0452"},     
						{ ID_ESQUEMA : "52" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0152"},     
						{ ID_ESQUEMA : "52" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0252"},     
						{ ID_ESQUEMA : "52" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0352"},     
						{ ID_ESQUEMA : "52" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0452"},     
						{ ID_ESQUEMA : "52" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0152"},     
						{ ID_ESQUEMA : "53" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0153"},     
						{ ID_ESQUEMA : "53" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0253"},     
						{ ID_ESQUEMA : "53" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0353"},     
						{ ID_ESQUEMA : "53" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0453"},     
						{ ID_ESQUEMA : "53" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0553"},     
						{ ID_ESQUEMA : "53" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0653"},     
						{ ID_ESQUEMA : "53" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0753"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0153"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0253"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0353"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0453"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0553"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0653"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0753"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0853"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0953"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "10" , PREGUNTA : "IDN1053"},     
						{ ID_ESQUEMA : "53" , COLOR : "N" , ORDEN_PULSADOR : "11" , PREGUNTA : "IDN1153"},     
						{ ID_ESQUEMA : "53" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0153"},     
						{ ID_ESQUEMA : "53" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0253"},     
						{ ID_ESQUEMA : "53" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0353"},     
						{ ID_ESQUEMA : "53" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0453"},     
						{ ID_ESQUEMA : "53" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0553"},     
						{ ID_ESQUEMA : "53" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0653"},     
						{ ID_ESQUEMA : "53" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0153"},     
						{ ID_ESQUEMA : "53" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0253"},     
						{ ID_ESQUEMA : "53" , COLOR : "V" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDV0353"},     
						{ ID_ESQUEMA : "53" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0153"},     
						{ ID_ESQUEMA : "54" , COLOR : "M" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDM0154"},     
						{ ID_ESQUEMA : "54" , COLOR : "M" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDM0254"},     
						{ ID_ESQUEMA : "54" , COLOR : "M" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDM0354"},     
						{ ID_ESQUEMA : "54" , COLOR : "M" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDM0454"},     
						{ ID_ESQUEMA : "54" , COLOR : "M" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDM0554"},     
						{ ID_ESQUEMA : "54" , COLOR : "M" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDM0654"},     
						{ ID_ESQUEMA : "54" , COLOR : "M" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDM0754"},     
						{ ID_ESQUEMA : "54" , COLOR : "M" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDM0854"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDN0154"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDN0254"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDN0354"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDN0454"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDN0554"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDN0654"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "7" , PREGUNTA : "IDN0754"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "8" , PREGUNTA : "IDN0854"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "9" , PREGUNTA : "IDN0954"},     
						{ ID_ESQUEMA : "54" , COLOR : "N" , ORDEN_PULSADOR : "10" , PREGUNTA : "IDN1054"},     
						{ ID_ESQUEMA : "54" , COLOR : "R" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDR0154"},     
						{ ID_ESQUEMA : "54" , COLOR : "R" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDR0254"},     
						{ ID_ESQUEMA : "54" , COLOR : "R" , ORDEN_PULSADOR : "3" , PREGUNTA : "IDR0354"},     
						{ ID_ESQUEMA : "54" , COLOR : "R" , ORDEN_PULSADOR : "4" , PREGUNTA : "IDR0454"},     
						{ ID_ESQUEMA : "54" , COLOR : "R" , ORDEN_PULSADOR : "5" , PREGUNTA : "IDR0554"},     
						{ ID_ESQUEMA : "54" , COLOR : "R" , ORDEN_PULSADOR : "6" , PREGUNTA : "IDR0654"},     
						{ ID_ESQUEMA : "54" , COLOR : "V" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDV0154"},     
						{ ID_ESQUEMA : "54" , COLOR : "V" , ORDEN_PULSADOR : "2" , PREGUNTA : "IDV0254"},  
						{ ID_ESQUEMA : "54" , COLOR : "Z" , ORDEN_PULSADOR : "1" , PREGUNTA : "IDZ0154"}]);    
					

					SAP_UI.writeIDB("PREGUNTAS_E_INFORMACION",[
					   {PREGUNTA : "IDM0101", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0102", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0103", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0104", TEXT_BOTON : "\u00BFCONSCIENCIA DISM. ATRIBUIBLE A EFECTOS  ALCOHOL?", INFORMACION_PREGUNTA : "PACIENTE NO COMPLETAMENTE ALERTA, CON CLARO ANTECEDENTE DE INGESTI\u00D3N DE ALCOHOL Y EN EL QUE SE HAYAN EXCLUIDO COMPLETAMENTE OTRAS CAUDAD QUE DISMINUYAN NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0105", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0106", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0107", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0108", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0109", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0110", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0111", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0112", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0113", TEXT_BOTON : "\u00BFHIPERGLICEMIA (>300MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MAYOR A 300MG/DL (17MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0114", TEXT_BOTON : "\u00BFHISTORIA DE V\u00D3MITO AGUDO DE SANGRE?", INFORMACION_PREGUNTA : "HEMATEMESIS FRESCA, V\u00D3MITO DE SANGRE DIGERIDA (CUNCHO DE CAF\u00C9) O SANGRE MEZCLADA CON V\u00D3MITO EN LAS \u00DALTIMAS 24 H.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0115", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0116", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0117", TEXT_BOTON : "\u00BFHISTORIA DE V\u00D3MITO AGUDO DE SANGRE?", INFORMACION_PREGUNTA : "HEMATEMESIS FRESCA, V\u00D3MITO DE SANGRE DIGERIDA (CUNCHO DE CAF\u00C9) O SANGRE MEZCLADA CON V\u00D3MITO EN LAS \u00DALTIMAS 24 H.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0118", TEXT_BOTON : "\u00BFHISTORIA DE V\u00D3MITO AGUDO DE SANGRE?", INFORMACION_PREGUNTA : "HEMATEMESIS FRESCA, V\u00D3MITO DE SANGRE DIGERIDA (CUNCHO DE CAF\u00C9) O SANGRE MEZCLADA CON V\u00D3MITO EN LAS \u00DALTIMAS 24 H.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0119", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0120", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0121", TEXT_BOTON : "\u00BFCOMIENZO R\u00C1PIDO?", INFORMACION_PREGUNTA : "APARICI\u00D3N EN LAS 12H PREVIAS", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0122", TEXT_BOTON : "\u00BFCELULITIS ESCROTAL?", INFORMACION_PREGUNTA : "ENROJECIMIENTO Y TUMEFACCI\u00D3N SOBRE EL ESCROTO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0123", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0124", TEXT_BOTON : "\u00BFTENSI\u00D3N ARTERIAL ALTA?", INFORMACION_PREGUNTA : "HISTORIA DE AUMENTO DE LA TENSI\u00D3N ARTERIAL O TENSI\u00D3N ARTERIAL ELEVADA EN EL MOMENTO DEL EXAMEN F\u00CDSICO.", TIPO_PREGUNTA : "3"},
                       {PREGUNTA : "IDM0126", TEXT_BOTON : "\u00BFRIESGO MODERADO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES SIN UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE NO LO HAN INTENTADO ACTIVAMENTE, QUE NO EST\u00C1N PRETENDIENDO AUTOLESIONARSE PERO QUE MANIFIESTAN DESEO DE HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0127", TEXT_BOTON : "\u00BFEXANTEMA O AMPOLLAS GENERALIZADAS?", INFORMACION_PREGUNTA : "EXANTEMA O AMPOLLA QUE SE EXTIENDE A M\u00C1S DEL 10% DE LA SCT.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0128", TEXT_BOTON : "\u00BFSECRECIONES O AMPOLLAS GENERALIZADAS?", INFORMACION_PREGUNTA : "CUALQUIER SECRECI\u00D3N O ERUPCI\u00D3N AMPOLLOSA QUE INTERESE M\u00C1S DEL 10% DE LA SCT", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0129", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0130", TEXT_BOTON : "\u00BFHISTORIA DE V\u00D3MITO AGUDO DE SANGRE?", INFORMACION_PREGUNTA : "HEMATEMESIS FRESCA, V\u00D3MITO DE SANGRE DIGERIDA (CUNCHO DE CAF\u00C9) O SANGRE MEZCLADA CON V\u00D3MITO EN LAS \u00DALTIMAS 24 H.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0131", TEXT_BOTON : "\u00BFTRAUMATISMO VAGINAL?", INFORMACION_PREGUNTA : "HISTORIA U OTRA EVIDENCIA DE TRAUMATISMO DIRECTO EN LA VAGINA", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0132", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0133", TEXT_BOTON : "\u00BFARTICULACI\u00D3N CALIENTE?", INFORMACION_PREGUNTA : "CUALQUIER AUMENTO DE LA TEMPERATURA SOBRE UNA ARTICULACI\u00D3N O ALREDEDOR DE ELLA. A MENUDO VA ACOMPA\u00D1ADO DE ENROJECIMIENTO", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0134", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0135", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0136", TEXT_BOTON : "\u00BFARTICULACI\u00D3N CALIENTE?", INFORMACION_PREGUNTA : "CUALQUIER AUMENTO DE LA TEMPERATURA SOBRE UNA ARTICULACI\u00D3N O ALREDEDOR DE ELLA. A MENUDO VA ACOMPA\u00D1ADO DE ENROJECIMIENTO", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0137", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0138", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0139", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0140", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0141", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0142", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0143", TEXT_BOTON : "\u00BFAVULSI\u00D3N DENTAL AGUDA?", INFORMACION_PREGUNTA : "SEPARACI\u00D3N O ARRANCAMIENTO DE UNA PIEZA DENTAL EN LAS 24H PREVIAS", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0144", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0145", TEXT_BOTON : "\u00BFP\u00C9RDIDA DE AGUDEZA VISUAL RECIENTE?", INFORMACION_PREGUNTA : "CUALQUIER P\u00C9RDIDA DE LA AGUDEZA VISUAL EN LOS 7 D\u00CDAS PREVIOS, EN PACIENTES CON D\u00C9FICIT VISUAL CORREGIDO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0146", TEXT_BOTON : "\u00BFHEMATURIA FRANCA?", INFORMACION_PREGUNTA : "COLORACI\u00D3N ROJIZA DE LA ORINA CAUSADA POR SANGRE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0147", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0148", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0149", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0150", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0151", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0152", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0153", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0154", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO BAJA (<95% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDM0201", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0202", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0203", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0204", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0205", TEXT_BOTON : "\u00BFANGUSTIA PERCEPTIBLE?", INFORMACION_PREGUNTA : "PACIENTES EN LOS QUE ES EVIDENTE QUE EST\u00C1N ALTERADOS F\u00CDSICA O EMOCIONALMENTE", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0206", TEXT_BOTON : "\u00BFFLUJO ESPIRATORIO PICO (FEP) BAJO (<50% ESP)?", INFORMACION_PREGUNTA : "EL FLUJO ESPIRATORIO M\u00C1XIMO DEPENDE DE EDAD Y SEXO DEL PACIENTE. SE CUMPLE \u00C9STE CRITERIO SI EL VALOR MEDIDO ES MENOR AL 50% DEL ESPERADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0207", TEXT_BOTON : "\u00BFNO COME?", INFORMACION_PREGUNTA : "NI\u00D1OS QUE NO INGIEREN ALIMENTOS O LIQUIDOS POR BOCA. NI\u00D1OS QUE COMAN PERO VOMITAN SIEMPRE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0208", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0209", TEXT_BOTON : "\u00BFP\u00C9RDIDA DE AGUDEZA VISUAL RECIENTE?", INFORMACION_PREGUNTA : "CUALQUIER P\u00C9RDIDA DE LA AGUDEZA VISUAL EN LOS 7 D\u00CDAS PREVIOS, EN PACIENTES CON D\u00C9FICIT VISUAL CORREGIDO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0210", TEXT_BOTON : "\u00BFHISTORIA DE TRAUMATISMO CRANEOENCEF\u00C1LICO?", INFORMACION_PREGUNTA : "ANTECEDENTE DE TRAUMATISMO F\u00CDSICO, RECIENTE EN EL QUE EST\u00C9 INVOLUCRADA LA CABEZA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0211", TEXT_BOTON : "\u00BFHISTORIA DE TRAUMATISMO CRANEOENCEF\u00C1LICO?", INFORMACION_PREGUNTA : "ANTECEDENTE DE TRAUMATISMO F\u00CDSICO, RECIENTE EN EL QUE EST\u00C9 INVOLUCRADA LA CABEZA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0212", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0213", TEXT_BOTON : "\u00BFV\u00D3MITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0214", TEXT_BOTON : "\u00BFHECES NEGRAS O COLOR GROSELLA?", INFORMACION_PREGUNTA : "CUALQUIER ENNEGRECIMIENTO CUMPLE EL CRITERIO DE HECES NEGRAS, UNA DEPOSICI\u00D3N ROJA-OSCURA, SE CONSIDERA GROSELLA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0215", TEXT_BOTON : "\u00BFFLUJO ESPIRATORIO PICO (FEP) BAJO (<50% ESP.)?", INFORMACION_PREGUNTA : "EL FLUJO ESPIRATORIO M\u00C1XIMO DEPENDE DE EDAD Y SEXO DEL PACIENTE. SE CUMPLE \u00C9STE CRITERIO SI EL VALOR MEDIDO ES MENOR AL 50% DEL ESPERADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0216", TEXT_BOTON : "\u00BFFLUJO ESPIRATORIO PICO (FEP) BAJO (<50% ESP.)?", INFORMACION_PREGUNTA : "EL FLUJO ESPIRATORIO M\u00C1XIMO DEPENDE DE EDAD Y SEXO DEL PACIENTE. SE CUMPLE \u00C9STE CRITERIO SI EL VALOR MEDIDO ES MENOR AL 50% DEL ESPERADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0217", TEXT_BOTON : "\u00BFHECES NEGRAS O COLOR GROSELLA?", INFORMACION_PREGUNTA : "CUALQUIER ENNEGRECIMIENTO CUMPLE EL CRITERIO DE HECES NEGRAS, UNA DEPOSICI\u00D3N ROJA-OSCURA, SE CONSIDERA GROSELLA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0218", TEXT_BOTON : "\u00BFHECES NEGRAS O COLOR GROSELLA?", INFORMACION_PREGUNTA : "CUALQUIER ENNEGRECIMIENTO CUMPLE EL CRITERIO DE HECES NEGRAS, UNA DEPOSICI\u00D3N ROJA-OSCURA, SE CONSIDERA GROSELLA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0219", TEXT_BOTON : "\u00BFTRAUMATISMO DIRECTO EN EL CUELLO?", INFORMACION_PREGUNTA : "PUEDE SER DE ARRIBA A ABAJO (CARGA) POR FLEXI\u00D3N (HACIA ADELANTE, ATR\u00C1S O EL LADO) O POR ROTACI\u00D3N O ESTIRAMIENTO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0220", TEXT_BOTON : "\u00BFTRAUMATISMO DIRECTO EN LA ESPALDA?", INFORMACION_PREGUNTA : "PUEDE SER DE ARRIBA A ABAJO (CARGA) POR FLEXI\u00D3N (HACIA ADELANTE, ATR\u00C1S O EL LADO) O POR ROTACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0221", TEXT_BOTON : "\u00BFHISTORIA DE VIAJE RECIENTE AL EXTRANJERO?", INFORMACION_PREGUNTA : "VIAJE RECIENTE Y SIGNIFICATIVO AL EXTRANJERO EN LAS 2 SEMANAS PREVIAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0222", TEXT_BOTON : "\u00BFVOMITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0223", TEXT_BOTON : "\u00BFV\u00D3MITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0224", TEXT_BOTON : "\u00BFSANGRADO VAGINAL?", INFORMACION_PREGUNTA : "CUALQUIER SANGRADO POR LA VAGINA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0226", TEXT_BOTON : "\u00BFRIESGO MODERADO DE LESIONAR A OTROS?", INFORMACION_PREGUNTA : "POSIBILIDAD MODERADA DE DA\u00D1AR A OTROS. SE OBSERVA POSTURA DEL CUERPO TENSA, APRETANDO PU\u00D1OS, LENGUAJE CON GRITOS Y AMENAZANTE Y COMPORTAMIENTO MOTOR PASEANTE E INQUIETO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0227", TEXT_BOTON : "\u00BFARTICULACI\u00D3N CALIENTE?", INFORMACION_PREGUNTA : "CUALQUIER AUMENTO DE LA TEMPERATURA SOBRE UNA ARTICULACI\u00D3N O ALREDEDOR DE ELLA. A MENUDO VA ACOMPA\u00D1ADO DE ENROJECIMIENTO", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0228", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0229", TEXT_BOTON : "\u00BFEXANTEMA O AMPOLLAS GENERALIZADAS?", INFORMACION_PREGUNTA : "EXANTEMA O AMPOLLA QUE SE EXTIENDE A M\u00C1S DEL 10% DE LA SCT.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0230", TEXT_BOTON : "\u00BFHECES NEGRAS O COLOR GROSELLA?", INFORMACION_PREGUNTA : "CUALQUIER ENNEGRECIMIENTO CUMPLE EL CRITERIO DE HECES NEGRAS, UNA DEPOSICI\u00D3N ROJA-OSCURA, SE CONSIDERA GROSELLA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0231", TEXT_BOTON : "\u00BFPOSIBLE EMBARAZO?", INFORMACION_PREGUNTA : "MUJER QUE NO HA TENIDO LA MENSTRUACI\u00D3N NORMAL. MUJER EN EDAD F\u00C9RTIL QUE MANTIENE RELACIONES SEXUALES SIN PROTECCI\u00D3N SE CONSIDERA COMO POTENCIALMENTE EMBARAZADA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0232", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0233", TEXT_BOTON : "\u00BFDOLOR AL MOVER LA ARTICULACI\u00D3N?", INFORMACION_PREGUNTA : "PUEDE SER TANTO EN MOVIMIENTO ACTIVO (PACIENTE), COMO PASIVO (EXAMINADOR).", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0234", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0235", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0236", TEXT_BOTON : "\u00BFDOLOR AL MOVER LA ARTICULACI\u00D3N?", INFORMACION_PREGUNTA : "PUEDE SER TANTO EN MOVIMIENTO ACTIVO (PACIENTE), COMO PASIVO (EXAMINADOR).", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0237", TEXT_BOTON : "\u00BFSIGNOS DE DESHIDRATACI\u00D3N?", INFORMACION_PREGUNTA : "LENGUA SECA, ENOFTALMOS, AUMENTO EN LOS PLIEGUES CUT\u00C1NEOS (TURGENCIA DE LA PIEL) EN BEBES FONTANELA ANTERIOR HUNDIDA Y OLIGURIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0238", TEXT_BOTON : "\u00BFLLANTO PROLONGADO O ININTERRUMPIDO?", INFORMACION_PREGUNTA : "UN NI\u00D1O QUE HA ESTADO LLORANDO DE FORMA CONTINUA DURANTE 2 O M\u00C1S HORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0239", TEXT_BOTON : "\u00BFSIGNOS DE DESHIDRATACI\u00D3N?", INFORMACION_PREGUNTA : "LENGUA SECA, ENOFTALMOS, AUMENTO EN LOS PLIEGUES CUT\u00C1NEOS (TURGENCIA DE LA PIEL) EN BEBES FONTANELA ANTERIOR HUNDIDA Y OLIGURIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0240", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0241", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0242", TEXT_BOTON : "\u00BFHISTORIA DE TRAUMATISMO CRANEOENCEF\u00C1LICO?", INFORMACION_PREGUNTA : "ANTECEDENTE DE TRAUMATISMO F\u00CDSICO, RECIENTE EN EL QUE EST\u00C9 INVOLUCRADA LA CABEZA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0243", TEXT_BOTON : "\u00BFHEMORRAGIA MENOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0244", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0245", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0246", TEXT_BOTON : "\u00BFVOMITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0247", TEXT_BOTON : "\u00BFINHALACI\u00D3N DE HUMO?", INFORMACION_PREGUNTA : "SE DEBER\u00CDA CONSIDERAR LA INHALACI\u00D3N DE HUMO SI EL PACIENTE HA ESTADO ENCERRADO EN UN ESPACIO LLENO DE HUMO. SIGNOS COMO HOLL\u00CDN ORAL O NASAL SON MENOS VALORABLES PERO SIGNIFICATIVOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0248", TEXT_BOTON : "\u00BFANGUSTIA PERCEPTIBLE?", INFORMACION_PREGUNTA : "PACIENTES EN LOS QUE ES EVIDENTE QUE EST\u00C1N ALTERADOS F\u00CDSICA O EMOCIONALMENTE", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0249", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE M\u00C1S DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO INCLUYENDO P\u00C9RDIDA O ALTERACI\u00D3N DE LA SENSIBILIDAD, DEBILIDAD DE LOS MIEMBROS (TRANSITORIO O PERMANENTE) Y ALTERACIONES EN LA MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0250", TEXT_BOTON : "\u00BFPALPITACIONES PRESENTES?", INFORMACION_PREGUNTA : "SENSACI\u00D3N DE QUE EL CORAZ\u00D3N VA DEPRISA. PRESENTE EN EL MOMENTO DE LA VALORACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0251", TEXT_BOTON : "\u00BFEXANTEMA O AMPOLLAS GENERALIZADAS?", INFORMACION_PREGUNTA : "EXANTEMA O AMPOLLA QUE SE EXTIENDE A M\u00C1S DEL 10% DE LA SCT.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0252", TEXT_BOTON : "\u00BFSIGNOS DE DESHIDRATACI\u00D3N?", INFORMACION_PREGUNTA : "LENGUA SECA, ENOFTALMOS, AUMENTO EN LOS PLIEGUES CUT\u00C1NEOS (TURGENCIA DE LA PIEL) EN BEBES FONTANELA ANTERIOR HUNDIDA Y OLIGURIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0253", TEXT_BOTON : "\u00BFSIGNOS DE DESHIDRATACI\u00D3N?", INFORMACION_PREGUNTA : "LENGUA SECA, ENOFTALMOS, AUMENTO EN LOS PLIEGUES CUT\u00C1NEOS (TURGENCIA DE LA PIEL) EN BEBES FONTANELA ANTERIOR HUNDIDA Y OLIGURIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0254", TEXT_BOTON : "\u00BFSIGNOS DE DESHIDRATACI\u00D3N?", INFORMACION_PREGUNTA : "LENGUA SECA, ENOFTALMOS, AUMENTO EN LOS PLIEGUES CUT\u00C1NEOS (TURGENCIA DE LA PIEL) EN BEBES FONTANELA ANTERIOR HUNDIDA Y OLIGURIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0301", TEXT_BOTON : "\u00BFEXANTEMA O AMPOLLAS GENERALIZADAS?", INFORMACION_PREGUNTA : "EXANTEMA O AMPOLLA QUE SE EXTIENDE A M\u00C1S DEL 10% DE LA SCT.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0302", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0303", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0304", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0305", TEXT_BOTON : "\u00BFRIESGO MODERADO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES SIN UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE NO LO HAN INTENTADO ACTIVAMENTE, QUE NO EST\u00C1N PRETENDIENDO AUTOLESIONARSE PERO QUE MANIFIESTAN DESEO DE HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0306", TEXT_BOTON : "\u00BFNO MEJORA CON EL PROPIO TRATAMIENTO DE ASMA?", INFORMACION_PREGUNTA : "SIGNO MANIFESTADO POR EL PACIENTE. LA INCAPACIDAD DE MEJORAR CON EL TRATAMIENTO DE BRONCODILATADORES RECETADO POR EL M\u00C9DICO GENERAL O APLICADO EN URGENCIAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0307", TEXT_BOTON : "\u00BFINCONSOLABLE POR LOS PADRES?", INFORMACION_PREGUNTA : "CUMPLEN CON \u00C9STE CRITERIO LOS NI\u00D1OS CUYO LLANTO O SUFRIMIENTO NO RESPONDE AL INTENTO DE CONSUELO POR PARTE DE LOS PADRES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0308", TEXT_BOTON : "\u00BFDEFORMIDAD GROSERA?", INFORMACION_PREGUNTA : "SIEMPRE ES SUBJETIVO; ANGULACI\u00D3N O ROTACI\u00D3N GROSERA Y ANORMAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0309", TEXT_BOTON : "\u00BFDOLOR ZONA TEMPORAL?", INFORMACION_PREGUNTA : "DOLOR A LA PALPACI\u00D3N EN ZONA TEMPORAL (ESPECIALMENTE SOBRE LA ARTERIA)", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0310", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0311", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0312", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0313", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0314", TEXT_BOTON : "\u00BFV\u00D3MITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0315", TEXT_BOTON : "\u00BFDOLOR PLEUR\u00CDTICO?", INFORMACION_PREGUNTA : "DOLOR TOR\u00C1CICO PUNZANTE QUE EMPEORA CON LA RESPIRACI\u00D3N, LA TOS O EL ESTORNUDO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0316", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0317", TEXT_BOTON : "\u00BFV\u00D3MITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0318", TEXT_BOTON : "\u00BFV\u00D3MITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0319", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0320", TEXT_BOTON : "\u00BFIMPOSIBILIDAD PARA DEAMBULAR?", INFORMACION_PREGUNTA : "SE DEBE DIFERENCIAR ENTRE PACIENTES QUE TIENEN DOLOR O IMPOSIBILIDAD PARA CAMINAR Y AQUELLOS QUE NO PUEDEN HACERLO, SOLO \u00C9STOS \u00DALTIMOS SE LES INCLUYE EN \u00C9STE CRITERIO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0321", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0322", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0323", TEXT_BOTON : "\u00BFHISTORIA CARD\u00CDACA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "UNA ARRITMIA RECURRENTE CON POSIBLE RIESGO VITAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0324", TEXT_BOTON : "\u00BFHISTORIA DE TRAUMATISMO?", INFORMACION_PREGUNTA : "HISTORIA DE TRAUMATISMO F\u00CDSICO RECIENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0326", TEXT_BOTON : "\u00BFANGUSTIA PERCEPTIBLE?", INFORMACION_PREGUNTA : "PACIENTES EN LOS QUE ES EVIDENTE QUE EST\u00C1N ALTERADOS F\u00CDSICA O EMOCIONALMENTE", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0327", TEXT_BOTON : "\u00BFDOLOR AL MOVER LA ARTICULACI\u00D3N?", INFORMACION_PREGUNTA : "PUEDE SER TANTO EN MOVIMIENTO ACTIVO (PACIENTE), COMO PASIVO (EXAMINADOR).", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0328", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0329", TEXT_BOTON : "\u00BFLETALIDAD MODERADA DE AGENTE QU\u00CDMICO?", INFORMACION_PREGUNTA : "LETALIDAD ES LA CAPACIDAD DE UN AGENTE QU\u00CDMICO DE CAUSAR DA\u00D1O. PUEDE SER NECESARIA INFORMACI\u00D3N TOXICOL\u00D3GICA AUTORIZADA PARA ESTABLECER EL NIVEL DEL RIESGO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0330", TEXT_BOTON : "\u00BFTRANSTORNO DE LA COAGULACI\u00D3N?", INFORMACION_PREGUNTA : "TRANSTORNO DE LA COAGULACI\u00D3N CONG\u00C9NITO O ADQUIRIDO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0331", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0332", TEXT_BOTON : "\u00BFTRAUMATISMO VAGINAL?", INFORMACION_PREGUNTA : "HISTORIA U OTRA EVIDENCIA DE TRAUMATISMO DIRECTO EN LA VAGINA", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0333", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0334", TEXT_BOTON : "\u00BFDOLOR PLEUR\u00CDTICO?", INFORMACION_PREGUNTA : "DOLOR TOR\u00C1CICO PUNZANTE QUE EMPEORA CON LA RESPIRACI\u00D3N, LA TOS O EL ESTORNUDO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0335", TEXT_BOTON : "\u00BFLETALIDAD MODERADA POR ENVENENAMIENTO?", INFORMACION_PREGUNTA : "LETALIDAD ES EL POTENCIAL DEL VENENO PARA CAUSAR DA\u00D1O, ENFERMEDAD GRAVE O MUERTE. EL CONOCIMIENTO LOCAL PUEDE PERMITIR LA IDENTIFICACI\u00D3N DEL AGENTE, PUEDE SER NECESARIO CONCENSO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0336", TEXT_BOTON : "\u00BFTRANSTORNO DE LA COAGULACI\u00D3N?", INFORMACION_PREGUNTA : "TRANSTORNO DE LA COAGULACI\u00D3N CONG\u00C9NITO O ADQUIRIDO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0337", TEXT_BOTON : "\u00BFNO COME?", INFORMACION_PREGUNTA : "NI\u00D1OS QUE NO INGIEREN ALIMENTOS O LIQUIDOS POR BOCA. NI\u00D1OS QUE COMAN PERO VOMITAN SIEMPRE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0338", TEXT_BOTON : "\u00BFNO COME?", INFORMACION_PREGUNTA : "NI\u00D1OS QUE NO INGIEREN ALIMENTOS O LIQUIDOS POR BOCA. NI\u00D1OS QUE COMAN PERO VOMITAN SIEMPRE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0339", TEXT_BOTON : "\u00BFNO COME?", INFORMACION_PREGUNTA : "NI\u00D1OS QUE NO INGIEREN ALIMENTOS O LIQUIDOS POR BOCA. NI\u00D1OS QUE COMAN PERO VOMITAN SIEMPRE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0340", TEXT_BOTON : "\u00BFHISTORIA MEDICA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "CIALQUIER CONDICI\u00D3N M\u00C9DICA PREEXISTENTE QUE REQUIERA CONTINUDIDAD EN LA MEDICACI\u00D3N U OTRO CUIDADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0341", TEXT_BOTON : "\u00BFDEFORMIDAD GROSERA?", INFORMACION_PREGUNTA : "SIEMPRE ES SUBJETIVO; ANGULACI\u00D3N O ROTACI\u00D3N GROSERA Y ANORMAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0342", TEXT_BOTON : "\u00BFV\u00D3MITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0343", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0344", TEXT_BOTON : "\u00BFDEFORMIDAD GROSERA?", INFORMACION_PREGUNTA : "SIEMPRE ES SUBJETIVO; ANGULACI\u00D3N O ROTACI\u00D3N GROSERA Y ANORMAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0345", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0346", TEXT_BOTON : "\u00BFRETENCI\u00D3N DE ORINA?", INFORMACION_PREGUNTA : "INCAPACIDAD DE ORINAR POR LA URETRA ASOCIADO A DITENSI\u00D3N DE LA VEJIGA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0347", TEXT_BOTON : "\u00BFLESI\u00D3N POR ELECTRICIDAD?", INFORMACION_PREGUNTA : "CUALQUIER LESI\u00D3N CAUSADA O POSIBLEMENTE CAUSADA POR CORRIENTE EL\u00C9CTRICA (CONTINUA O ALTERNA, NATURAL O ARTIFICIAL)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0348", TEXT_BOTON : "\u00BFLETALIDAD MODERADA?", INFORMACION_PREGUNTA : "LETALIDAD ES EL POTENCIAL DE LA SUSTANCIA PARA CAUSAR DA\u00D1O, ENFERMEDAD GRAVE O MUERTE. PUEDE REQUIERRI INFORME DE TOXICOLOG\u00CDA PARA ESTABLECER NIVEL DE RIESGO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0349", TEXT_BOTON : "\u00BFV\u00D3MITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0350", TEXT_BOTON : "\u00BFHISTORIA CARD\u00CDACA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "UNA ARRITMIA RECURRENTE CON POSIBLE RIESGO VITAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0351", TEXT_BOTON : "\u00BFPICOR O DOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "PRURITO QUE ES SOPORTABLE PERO INTENSO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0352", TEXT_BOTON : "\u00BFEXANTEMA O AMPOLLAS GENERALIZADAS?", INFORMACION_PREGUNTA : "EXANTEMA O AMPOLLA QUE SE EXTIENDE A M\u00C1S DEL 10% DE LA SCT.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0353", TEXT_BOTON : "\u00BFNO COME?", INFORMACION_PREGUNTA : "NI\u00D1OS QUE NO INGIEREN ALIMENTOS O LIQUIDOS POR BOCA. NI\u00D1OS QUE COMAN PERO VOMITAN SIEMPRE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0354", TEXT_BOTON : "\u00BFNO COME?", INFORMACION_PREGUNTA : "NI\u00D1OS QUE NO INGIEREN ALIMENTOS O LIQUIDOS POR BOCA. NI\u00D1OS QUE COMAN PERO VOMITAN SIEMPRE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0401", TEXT_BOTON : "\u00BFCOMIENZO R\u00C1PIDO?", INFORMACION_PREGUNTA : "APARICI\u00D3N EN LAS 12H PREVIAS", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0402", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0403", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0404", TEXT_BOTON : "\u00BFHISTORIA DE TRAUMATISMO CRANEOENCEF\u00C1LICO?", INFORMACION_PREGUNTA : "ANTECEDENTE DE TRAUMATISMO F\u00CDSICO, RECIENTE EN EL QUE EST\u00C9 INVOLUCRADA LA CABEZA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0405", TEXT_BOTON : "\u00BFHISTORIA PSIQUI\u00C1TRICA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "ANTECEDENTE DE UN EPISODIO PSIQUI\u00C1TRICO IMPORTANTE O ENFERMEDAD PSIQUI\u00C1TRICA MAYOR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0406", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0407", TEXT_BOTON : "\u00BFLLANTO PROLONGADO O ININTERRUMPIDO?", INFORMACION_PREGUNTA : "UN NI\u00D1O QUE HA ESTADO LLORANDO DE FORMA CONTINUA DURANTE 2 O M\u00C1S HORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0408", TEXT_BOTON : "\u00BFFRACTURA ABIERTA?", INFORMACION_PREGUNTA : "TODAS LAS HERIDAS EN LA PR\u00D3XIMIDAD DE UNA FRACTURA SE CONSIDERAN SOSPECHOSAS. CUALQUIER POSIBILIDAD DE COMUNICACI\u00D3N ENTRE UNA HERIDA Y FRACTURA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0409", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0410", TEXT_BOTON : "\u00BFHISTORIA PSIQUI\u00C1TRICA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "ANTECEDENTE DE UN EPISODIO PSIQUI\u00C1TRICO IMPORTANTE O ENFERMEDAD PSIQUI\u00C1TRICA MAYOR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0411", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0413", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0414", TEXT_BOTON : "\u00BFSIGNOS DE DESHIDRATACI\u00D3N?", INFORMACION_PREGUNTA : "LENGUA SECA, ENOFTALMOS, AUMENTO EN LOS PLIEGUES CUT\u00C1NEOS (TURGENCIA DE LA PIEL) EN BEBES FONTANELA ANTERIOR HUNDIDA Y OLIGURIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0415", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0416", TEXT_BOTON : "\u00BFDOLOR PLEUR\u00CDTICO?", INFORMACION_PREGUNTA : "DOLOR TOR\u00C1CICO PUNZANTE QUE EMPEORA CON LA RESPIRACI\u00D3N, LA TOS O EL ESTORNUDO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0417", TEXT_BOTON : "\u00BFPOSIBLE EMBARAZO?", INFORMACION_PREGUNTA : "MUJER QUE NO HA TENIDO LA MENSTRUACI\u00D3N NORMAL. MUJER EN EDAD F\u00C9RTIL QUE MANTIENE RELACIONES SEXUALES SIN PROTECCI\u00D3N SE CONSIDERA COMO POTENCIALMENTE EMBARAZADA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0418", TEXT_BOTON : "\u00BFMASA ABDOMINAL VISIBLE?", INFORMACION_PREGUNTA : "UNA MASA EN EL ABDOMEN QUE ES VISIBLE A SIMPLE VISTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0419", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0420", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0421", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0422", TEXT_BOTON : "\u00BFDOLOR C\u00D3LICO?", INFORMACION_PREGUNTA : "DOLOR QUE VA Y VIENE EN OLEADAS, EN EL C\u00D3LICO RENAL EL DOLOR VA Y VIENE EN PERIODOS DE 20 MIN O M\u00C1S.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0423", TEXT_BOTON : "\u00BFDOLOR PLEUR\u00CDTICO?", INFORMACION_PREGUNTA : "DOLOR TOR\u00C1CICO PUNZANTE QUE EMPEORA CON LA RESPIRACI\u00D3N, LA TOS O EL ESTORNUDO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0424", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0426", TEXT_BOTON : "\u00BFHISTORIA PSIQUI\u00C1TRICA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "ANTECEDENTE DE UN EPISODIO PSIQUI\u00C1TRICO IMPORTANTE O ENFERMEDAD PSIQUI\u00C1TRICA MAYOR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0427", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0428", TEXT_BOTON : "\u00BFPICOR O DOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "PRURITO QUE ES SOPORTABLE PERO INTENSO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0429", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0430", TEXT_BOTON : "\u00BFV\u00D3MITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0431", TEXT_BOTON : "\u00BFDOLOR ABDOMINAL?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE ABDOMEN. DOLOR ABDOMINAL IRRADIADO A ESPALDA PUEDE ESTAR ASOCIADO A ANEURISMA A\u00D3RTICO ABD. ASOCIADO A SANGRADO VAGINAL PUEDE INDICAR EMBARAZO ECT\u00D3PICO O ABORTO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0432", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0433", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0434", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0435", TEXT_BOTON : "\u00BFSECRECIONES O AMPOLLAS GENERALIZADAS?", INFORMACION_PREGUNTA : "CUALQUIER SECRECI\u00D3N O ERUPCI\u00D3N AMPOLLOSA QUE INTERESE M\u00C1S DEL 10% DE LA SCT", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0436", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0437", TEXT_BOTON : "\u00BFNO ORINA?", INFORMACION_PREGUNTA : "FALLO EN LA PRODUCCI\u00D3N Y ELIMINACI\u00D3N DE ORINA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0438", TEXT_BOTON : "\u00BFNO PUEDE SER ENTRETENIDO?", INFORMACION_PREGUNTA : "NI\u00D1O QUE SE ENCUENTRA MUY AFECTADO POR DOLOR U OTRA CAUSA, NO SE PUEDE DISTRAER CON CONVERSACI\u00D3N O JUEGO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0439", TEXT_BOTON : "\u00BFNO ORINA?", INFORMACION_PREGUNTA : "FALLO EN LA PRODUCCI\u00D3N Y ELIMINACI\u00D3N DE ORINA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0440", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0441", TEXT_BOTON : "\u00BFFRACTURA ABIERTA?", INFORMACION_PREGUNTA : "TODAS LAS HERIDAS EN LA PR\u00D3XIMIDAD DE UNA FRACTURA SE CONSIDERAN SOSPECHOSAS. CUALQUIER POSIBILIDAD DE COMUNICACI\u00D3N ENTRE UNA HERIDA Y FRACTURA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0442", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0443", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0444", TEXT_BOTON : "\u00BFP\u00C9RDIDA DE AGUDEZA VISUAL RECIENTE?", INFORMACION_PREGUNTA : "CUALQUIER P\u00C9RDIDA DE LA AGUDEZA VISUAL EN LOS 7 D\u00CDAS PREVIOS, EN PACIENTES CON D\u00C9FICIT VISUAL CORREGIDO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0445", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0446", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0447", TEXT_BOTON : "\u00BFLETALIDAD MODERADA DE AGENTE QU\u00CDMICO?", INFORMACION_PREGUNTA : "LETALIDAD ES LA CAPACIDAD DE UN AGENTE QU\u00CDMICO DE CAUSAR DA\u00D1O. PUEDE SER NECESARIA INFORMACI\u00D3N TOXICOL\u00D3GICA AUTORIZADA PARA ESTABLECER EL NIVEL DEL RIESGO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0448", TEXT_BOTON : "\u00BFRIESGO MODERADO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES SIN UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE NO LO HAN INTENTADO ACTIVAMENTE, QUE NO EST\u00C1N PRETENDIENDO AUTOLESIONARSE PERO QUE MANIFIESTAN DESEO DE HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0449", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0450", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0452", TEXT_BOTON : "\u00BFANGUSTIA PERCEPTIBLE?", INFORMACION_PREGUNTA : "PACIENTES EN LOS QUE ES EVIDENTE QUE EST\u00C1N LATERADOS F\u00CDSICA O EMOCIONALMENTE", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0453", TEXT_BOTON : "\u00BFNO ORINA?", INFORMACION_PREGUNTA : "FALLO EN LA PRODUCCI\u00D3N Y ELIMINACI\u00D3N DE ORINA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0454", TEXT_BOTON : "\u00BFNO ORINA?", INFORMACION_PREGUNTA : "FALLO EN LA PRODUCCI\u00D3N Y ELIMINACI\u00D3N DE ORINA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0501", TEXT_BOTON : "\u00BFHISTORIA DE VIAJE RECIENTE AL EXTRANJERO?", INFORMACION_PREGUNTA : "VIAJE RECIENTE Y SIGNIFICATIVO AL EXTRANJERO EN LAS 2 SEMANAS PREVIAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0502", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0503", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0504", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0505", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0507", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0508", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0509", TEXT_BOTON : "\u00BFV\u00D3MITO PERSISTENTE?", INFORMACION_PREGUNTA : "V\u00D3MITOS CONTINUOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0510", TEXT_BOTON : "\u00BFRIESGO MODERADO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES SIN UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE NO LO HAN INTENTADO ACTIVAMENTE, QUE NO EST\u00C1N PRETENDIENDO AUTOLESIONARSE PERO QUE MANIFIESTAN DESEO DE HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0514", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0516", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0517", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0518", TEXT_BOTON : "\u00BFINCONSOLABLE POR LOS PADRES?", INFORMACION_PREGUNTA : "CUMPLEN CON \u00C9STE CRITERIO LOS NI\u00D1OS CUYO LLANTO O SUFRIMIENTO NO RESPONDE AL INTENTO DE CONSUELO POR PARTE DE LOS PADRES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0520", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0522", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0523", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0524", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0526", TEXT_BOTON : "\u00BFCOMPORTAMIENTO PERTURBADOR?", INFORMACION_PREGUNTA : "COMPORTAMIENTO QUE AFECTA EL NORMAL FUNCIONAMIENTO DEL DEPARTAMENTO. PUEDE SER AMENAZANTE O IMPLICAR RIESGO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0527", TEXT_BOTON : "\u00BFDOLOR TESTICULAR?", INFORMACION_PREGUNTA : "DOLOR EN LOS TEST\u00CDCULOS.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0529", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0530", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0531", TEXT_BOTON : "\u00BFDOLOR EN EL V\u00C9RTICE DEL HOMBRO?", INFORMACION_PREGUNTA : "DOLOR QUE SE SIENTE EN EL V\u00C9RTICE DEL HOMBRO, INDICA A MENUDO IRRITACI\u00D3N DEL DIAFRAGMA.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0532", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0535", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0536", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0537", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0538", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0539", TEXT_BOTON : "\u00BFINCONSOLABLE CON LOS PADRES?", INFORMACION_PREGUNTA : "CUMPLEN CON \u00C9STE CRITERIO LOS NI\u00D1OS CUYO LLANTO O SUFRIMIENTO NO RESPONDE AL INTENTO DE CONSUELO POR PARTE DE LOS PADRES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0541", TEXT_BOTON : "\u00BFTRANSTORNO DE LA COAGULACI\u00D3N?", INFORMACION_PREGUNTA : "TRANSTORNO DE LA COAGULACI\u00D3N CONG\u00C9NITO O ADQUIRIDO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0542", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0543", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0544", TEXT_BOTON : "\u00BFAVULSI\u00D3N DENTAL AGUDA?", INFORMACION_PREGUNTA : "SEPARACI\u00D3N O ARRANCAMIENTO DE UNA PIEZA DENTAL EN LAS 24H PREVIAS", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0546", TEXT_BOTON : "\u00BFDOLOR C\u00D3LICO?", INFORMACION_PREGUNTA : "DOLOR QUE VA Y VIENE EN OLEADAS, EN EL C\u00D3LICO RENAL EL DOLOR VA Y VIENE EN PERIODOS DE 20 MIN O M\u00C1S.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0547", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0548", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0549", TEXT_BOTON : "\u00BFTRANSTORNO DE LA COAGULACI\u00D3N?", INFORMACION_PREGUNTA : "TRANSTORNO DE LA COAGULACI\u00D3N CONG\u00C9NITO O ADQUIRIDO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0552", TEXT_BOTON : "\u00BFTRAUMATISMO VAGINAL?", INFORMACION_PREGUNTA : "HISTORIA U OTRA EVIDENCIA DE TRAUMATISMO DIRECTO EN LA VAGINA", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0553", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0554", TEXT_BOTON : "\u00BFICTERICIA?", INFORMACION_PREGUNTA : "ICTERIA NEONATAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0601", TEXT_BOTON : "\u00BFHISTORIA HEMATOL\u00D3GICA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "PACIENTE CON UN TRASTORNO SANG\u00DANEO CONOCIDO QUE SE SABE DESARROLLA COMPLICACIONES R\u00C1PIDAMENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0605", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0607", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0608", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0609", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0610", TEXT_BOTON : "\u00BFRIESGO MODERADO DE LESIONAR A OTROS?", INFORMACION_PREGUNTA : "POSIBILIDAD MODERADA DE DA\u00D1AR A OTROS. SE OBSERVA POSTURA DEL CUERPO TENSA, APRETANDO PU\u00D1OS, LENGUAJE CON GRITOS Y AMENAZANTE Y COMPORTAMIENTO MOTOR PASEANTE E INQUIETO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0614", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0617", TEXT_BOTON : "\u00BFDOLOR EN EL V\u00C9RTICE DEL HOMBRO?", INFORMACION_PREGUNTA : "DOLOR QUE SE SIENTE EN EL V\u00C9RTICE DEL HOMBRO, INDICA A MENUDO IRRITACI\u00D3N DEL DIAFRAGMA.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0618", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0620", TEXT_BOTON : "\u00BFDOLOR C\u00D3LICO?", INFORMACION_PREGUNTA : "DOLOR QUE VA Y VIENE EN OLEADAS, EN EL C\u00D3LICO RENAL EL DOLOR VA Y VIENE EN PERIODOS DE 20 MIN O M\u00C1S.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0624", TEXT_BOTON : "\u00BFDOLOR EN EL V\u00C9RTICE DE HOMBRO?", INFORMACION_PREGUNTA : "DOLOR QUE SE SIENTE EN EL V\u00C9RTICE DEL HOMBRO, INDICA A MENUDO IRRITACI\u00D3N DEL DIAFRAGMA.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0627", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0631", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0632", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0635", TEXT_BOTON : "\u00BFPICOR O DOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "PRURITO QUE ES SOPORTABLE PERO INTENSO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0636", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0637", TEXT_BOTON : "\u00BFHISTORIA HEMATOL\u00D3GICA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "PACIENTE CON UN TRASTORNO SANG\u00DANEO CONOCIDO QUE SE SABE DESARROLLA COMPLICACIONES R\u00C1PIDAMENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0638", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0639", TEXT_BOTON : "\u00BFLLANTO PROLONGADO O ININTERRUMPIDO?", INFORMACION_PREGUNTA : "UN NI\u00D1O QUE HA ESTADO LLORANDO DE FORMA CONTINUA DURANTE 2 O M\u00C1S HORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0641", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0642", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0644", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0646", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0647", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0648", TEXT_BOTON : "\u00BFHISTORIA PSIQUI\u00C1TRICA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "ANTECEDENTE DE UN EPISODIO PSIQUI\u00C1TRICO IMPORTANTE O ENFERMEDAD PSIQUI\u00C1TRICA MAYOR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0649", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0652", TEXT_BOTON : "\u00BFHISTORIA DE INCONSCIENCIA?", INFORMACION_PREGUNTA : "SI HAY UN TESTIGO FIABLE QUE INDIQUE QUE EL PACIENTE ESTUVO INCONSCIENTE Y DURANTE CUANTO TIEMPO, SI NO LO HAY PACIENTE QUE NO RECUERDA EL INCIDENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0653", TEXT_BOTON : "\u00BFHISTORIA HEMATOL\u00D3GICA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "PACIENTE CON UN TRASTORNO SANG\u00DANEO CONOCIDO QUE SE SABE DESARROLLA COMPLICACIONES R\u00C1PIDAMENTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0654", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0701", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0707", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0708", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0709", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0717", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0718", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0720", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0724", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0731", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0737", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0738", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0739", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0741", TEXT_BOTON : "\u00BFDOLOR PLEUR\u00CDTICO?", INFORMACION_PREGUNTA : "DOLOR TOR\u00C1CICO PUNZANTE QUE EMPEORA CON LA RESPIRACI\u00D3N, LA TOS O EL ESTORNUDO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0744", TEXT_BOTON : "\u00BFTRANSTORNO DE LA COAGULACI\u00D3N?", INFORMACION_PREGUNTA : "TRANSTORNO DE LA COAGULACI\u00D3N CONG\u00C9NITO O ADQUIRIDO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0749", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0752", TEXT_BOTON : "\u00BFHISTORIA DE TRAUMATISMO CRANEOENCEF\u00C1LICO?", INFORMACION_PREGUNTA : "CUANDO EL MECANISMO SE\u00D1ALADO NO EXPLICA LA LESI\u00D3N O ENFERMEDAD", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0753", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0754", TEXT_BOTON : "\u00BFNEONATO CON FEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "PACIENTE MENOR DE 1 MES CON TEMPERATURA MENOR DE 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0801", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0808", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0809", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0818", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0837", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0839", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0841", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0844", TEXT_BOTON : "\u00BFHISTORIA INAPROPIADA?", INFORMACION_PREGUNTA : "CUANDO LA HISTORIA CONTADA NO JUSTIFICA LOS SIGNOS F\u00CDSICOS ENCONTRADOS. ES IMPORTANTE COMO DETECTOR EN TEMAS DE PROTECCI\u00D3N Y SALVAGUARDA EN ADULTO Y NI\u00D1OS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0852", TEXT_BOTON : "\u00BFRIESGO MODERADO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES SIN UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE NO LO HAN INTENTADO ACTIVAMENTE, QUE NO ESTAN PRETENDIENDO AUTOLESIONARSE PERO QUE MANIFIESTAN DESEO DE HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDM0854", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0939", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM0944", TEXT_BOTON : "\u00BFFIEBRE ALTA (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE PUEDE TENER FIEBRE ALTA. TEMPERATURA ENTRE 38,5-41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDM0952", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDM1044", TEXT_BOTON : "\u00BFDOLOR INTENSO (EVA 5-7)?", INFORMACION_PREGUNTA : "DOLOR SOPORTABLE PERO INTENSO. EVA 5-7.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0101", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0102", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0103", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0104", TEXT_BOTON : "\u00BFCONSCIENCIA DISM NO ATRIBUIBLE EFECTOS ALCOHOL?", INFORMACION_PREGUNTA : "PACIENTE NO COMPLETAMENTE ALERTA, CON ANTECEDENTE DE INGESTI\u00D3N DE ALCOHOL Y EN EL QUE PUEDEN CONCURRIR OTRAS CAUDAD QUE DISMINUYEN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0105", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0106", TEXT_BOTON : "\u00BFINCAPAZ DE DECIR FRASES?", INFORMACION_PREGUNTA : "PACIENTES QUE EST\u00C1N TAN DISN\u00C9ICOS QUE NO PUEDEN ARTICULAR UNA FRASE RELATICAMENTE CORTA DURANTE UNA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0107", TEXT_BOTON : "\u00BFHIPOTON\u00CDA INFANTIL?", INFORMACION_PREGUNTA : "LOS PADRES DESCRIBEN A SU HIJO SIN FUERZA, FL\u00C1CIDO, TONO REDUCIDO DE FORMA GENERAL. EL SIGNO M\u00C1S LLAMATIVO ES LA INCAPACIDAD DE SOSTENER LA CABEZA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0108", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0109", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0110", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0111", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0112", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0113", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0114", TEXT_BOTON : "\u00BFHIPOTONIA INFANTIL?", INFORMACION_PREGUNTA : "LOS PADRES DESCRIBEN A SU HIJO SIN FUERZA, FL\u00C1CIDO, TONO REDUCIDO DE FORMA GENERAL. EL SIGNO M\u00C1S LLAMATIVO ES LA INCAPACIDAD DE SOSTENER LA CABEZA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0115", TEXT_BOTON : "\u00BFINCAPAZ DE DECIR FRASES?", INFORMACION_PREGUNTA : "PACIENTES QUE EST\u00C1N TAN DISN\u00C9ICOS QUE NO PUEDEN ARTICULAR UNA FRASE RELATICAMENTE CORTA DURANTE UNA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0116", TEXT_BOTON : "\u00BFINCAPAZ DE DECIR FRASES?", INFORMACION_PREGUNTA : "PACIENTES QUE EST\u00C1N TAN DISN\u00C9ICOS QUE NO PUEDEN ARTICULAR UNA FRASE RELATICAMENTE CORTA DURANTE UNA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0117", TEXT_BOTON : "\u00BFV\u00D3MITO DE SANGRE?", INFORMACION_PREGUNTA : "V\u00D3MITO DE SANGRE QUE PUEDE SER FRESCA (BRILLANTE O ROJO OSCURO) O EN CUNCHO DE CAF\u00C9.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0118", TEXT_BOTON : "\u00BFV\u00D3MITO DE SANGRE?", INFORMACION_PREGUNTA : "V\u00D3MITO DE SANGRE QUE PUEDE SER FRESCA (BRILLANTE O ROJO OSCURO) O EN CUNCHO DE CAF\u00C9.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0119", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0120", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0121", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0122", TEXT_BOTON : "\u00BFGANGRENA ESCROTAL?", INFORMACION_PREGUNTA : "PIEL MUERTA Y ENNEGRECIDA SOBRE EL ESCROTO E INGLE. LA GANGRENA TEMPRANA PUEDE NO SER NEGRA PERO SI PARECER UNA QUEMADURA DE 3 GRADO CON O SIN DESCAMACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0123", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0124", TEXT_BOTON : "\u00BFSANGRADO VAGINAL ABUNDANTE?", INFORMACION_PREGUNTA : "LA PRESENCIA DE CO\u00C1GULOS  O SANGRADO CONSTANTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0126", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0127", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0128", TEXT_BOTON : "\u00BFEDEMA DE LA LENGUA?", INFORMACION_PREGUNTA : "TUMEFACCI\u00D3N DE LA LENGUA EN CUALQUIER GRADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0129", TEXT_BOTON : "\u00BFEDEMA DE LA LENGUA?", INFORMACION_PREGUNTA : "TUMEFACCI\u00D3N DE LA LENGUA EN CUALQUIER GRADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0130", TEXT_BOTON : "\u00BFV\u00D3MITO DE SANGRE?", INFORMACION_PREGUNTA : "V\u00D3MITO DE SANGRE QUE PUEDE SER FRESCA (BRILLANTE O ROJO OSCURO) O EN CUNCHO DE CAF\u00C9.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0131", TEXT_BOTON : "\u00BFSANGRADO VAGINAL ABUNDANTE?", INFORMACION_PREGUNTA : "LA PRESENCIA DE CO\u00C1GULOS  O SANGRADO CONSTANTE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0132", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0133", TEXT_BOTON : "\u00BFCOMPROMISO VASCULAR?", INFORMACION_PREGUNTA : "COMBINACI\u00D3N DE PALIDEZ, FRIALDAD, ALTERACI\u00D3N DE LA SENSIBILIDAD Y DOLOR, CON O SIN AUSENCIA DE PULSO DISTAL A LA LESI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0134", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0135", TEXT_BOTON : "\u00BFEDEMA FACIAL?", INFORMACION_PREGUNTA : "HINCHAZ\u00D3N DIFUSA QUE AFECTA A LA CARA. NORMALMENTE INCLUYENDO LOS LABIOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0136", TEXT_BOTON : "\u00BFCOMPROMISO VASCULAR?", INFORMACION_PREGUNTA : "COMBINACI\u00D3N DE PALIDEZ, FRIALDAD, ALTERACI\u00D3N DE LA SENSIBILIDAD Y DOLOR, CON O SIN AUSENCIA DE PULSO DISTAL A LA LESI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0137", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0138", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0139", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0140", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0141", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0142", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0143", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0144", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0145", TEXT_BOTON : "\u00BFLESI\u00D3N PENETRANTE EN OJO?", INFORMACION_PREGUNTA : "TRAUMATUSMO F\u00CDSICO RECIENTE QUE PERFORA EL GLOBO OCULAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0146", TEXT_BOTON : "\u00BFPRIAPISMO?", INFORMACION_PREGUNTA : "ERECCI\u00D3N MANTENIDA EN EL PENE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0147", TEXT_BOTON : "\u00BFEDEMA FACIAL?", INFORMACION_PREGUNTA : "HINCHAZ\u00D3N DIFUSA QUE AFECTA A LA CARA. NORMALMENTE INCLUYENDO LOS LABIOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0148", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0149", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0150", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0151", TEXT_BOTON : "\u00BFEDEMA DE LA LENGUA?", INFORMACION_PREGUNTA : "TUMEFACCI\u00D3N DE LA LENGUA EN CUALQUIER GRADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0152", TEXT_BOTON : "\u00BFRESPONDE SOLO A LA VOZ O AL DOLOR?", INFORMACION_PREGUNTA : "RESPUESTA A EST\u00CDMULO DOLOROSO O A LA VOZ. PARA EL DOLOR SE PUEDEN UTILIZAR EST\u00CDMULOS PER\u00CDFERICOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0153", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0154", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0201", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100L/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0202", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0203", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N, QUE CONTINUA SANGRANDO LIGERAMENTE O REZUMA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0204", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0205", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0206", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0207", TEXT_BOTON : "\u00BFRESPONDE SOLO A LA VOZ O AL DOLOR?", INFORMACION_PREGUNTA : "RESPUESTA A EST\u00CDMULO DOLOROSO O A LA VOZ. PARA EL DOLOR SE PUEDEN UTILIZAR EST\u00CDMULOS PER\u00CDFERICOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0208", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0209", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0210", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0211", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0212", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0213", TEXT_BOTON : "\u00BFHIPERGLICEMIA CON CETOSIS (>200MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MAYOR A 200MG/DL (11MMOL/L) CON CUERPO CET\u00D3NICOS EN ORINA O SIGNOS DE ACIDOSIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0214", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0215", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0216", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0217", TEXT_BOTON : "\u00BFEMISI\u00D3N AGUDA SANGRE FRESCA/ALT. POR V\u00CDA RECTAL?", INFORMACION_PREGUNTA : "EN LA HEMORRAGIA G.I. ACTIVA Y MASIVA, SALDR\u00C1 SANGRE ROJA OSCURA POR V\u00CDA RECTAL. A MEDIDA QUE EL TIEMPO DE TR\u00C1NSITO GI AUMENTA LA SANGRE SE PONE M\u00C1S OSCURA, CONVIRTI\u00C9NDOSE EN MELENAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0218", TEXT_BOTON : "\u00BFEMISI\u00D3N AGUDA SANGRE FRESCA/ALT. POR V\u00CDA RECTAL?", INFORMACION_PREGUNTA : "EN LA HEMORRAGIA G.I. ACTIVA Y MASIVA, SALDR\u00C1 SANGRE ROJA OSCURA POR V\u00CDA RECTAL. A MEDIDA QUE EL TIEMPO DE TR\u00C1NSITO GI AUMENTA LA SANGRE SE PONE M\u00C1S OSCURA, CONVIRTI\u00C9NDOSE EN MELENAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0219", TEXT_BOTON : "\u00BFSIGNOS DE MENINGISMO?", INFORMACION_PREGUNTA : "RIGIDEZ EN LA NUCA JUNTO CON CEFALEA Y FOTOFOBIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0220", TEXT_BOTON : "\u00BFMECANISMO LESIONAL SIGNIFICATIVO?", INFORMACION_PREGUNTA : "SON SIGNIFICATIVAS O RELEVANTES  LAS HERIDAS PENETRANTES (PU\u00D1ALADA O DISPARO) Y LAS LESIONES CON ALTA TRANSFERENCIA DE ENERG\u00CDA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0221", TEXT_BOTON : "\u00BFINMUNOSUPRESI\u00D3N CONOCIDA O PROBABLE?", INFORMACION_PREGUNTA : "CUALQUIER PACIENTE EN EL QUE SE CONOCE O SE PRESUME QUE EST\u00C1 INMUNODEPRIMIDO INCLUYENDO AQUELLOS QUE USAN DROGAS INMUNOSUPRESORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0222", TEXT_BOTON : "\u00BFEDAD MENOR A 25 A\u00D1OS?", INFORMACION_PREGUNTA : "PERSONA MENOR DE 25 A\u00D1OS DE EDAD.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0223", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0224", TEXT_BOTON : "\u00BFSANGRADO VAGINAL EN GESTANTE DE 20 A M\u00C1S SEMANAS?", INFORMACION_PREGUNTA : "CUALQUIER SANGRADO VAGINAL EN UNA MUJER EMBARAZADA DE 20 SEMANAS O M\u00C1S-", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0226", TEXT_BOTON : "\u00BFRIESGO ALTO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES CON UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE LO HAN INTENTADO ACTIVAMENTE O EST\u00C1N PRETENDIENDO HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0227", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURPUR\u00C9O NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0228", TEXT_BOTON : "\u00BFEDEMA FACIAL?", INFORMACION_PREGUNTA : "HINCHAZ\u00D3N DIFUSA QUE AFECTA A LA CARA. NORMALMENTE INCLUYENDO LOS LABIOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0229", TEXT_BOTON : "\u00BFEDEMA FACIAL?", INFORMACION_PREGUNTA : "HINCHAZ\u00D3N DIFUSA QUE AFECTA A LA CARA. NORMALMENTE INCLUYENDO LOS LABIOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0230", TEXT_BOTON : "\u00BFEMISI\u00D3N AGUDA SANGRE FRESCA/ALT. POR V\u00CDA RECTAL?", INFORMACION_PREGUNTA : "EN LA HEMORRAGIA G.I. ACTIVA Y MASIVA, SALDR\u00C1 SANGRE ROJA OSCURA POR V\u00CDA RECTAL. A MEDIDA QUE EL TIEMPO DE TR\u00C1NSITO GI AUMENTA LA SANGRE SE PONE M\u00C1S OSCURA, CONVIRTI\u00C9NDOSE EN MELENAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0231", TEXT_BOTON : "\u00BFSANGRADO VAGINAL EN GESTANTE DE 20 O M\u00C1S SEMANAS?", INFORMACION_PREGUNTA : "CUALQUIER SANGRADO VAGINAL EN UNA MUJER EMBARAZADA DE 20 SEMANAS O M\u00C1S.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0232", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0233", TEXT_BOTON : "\u00BFENFISEMA SUBCUT\u00C1NEO?", INFORMACION_PREGUNTA : "EL GAS BAJO LA PIEL PUEDE SER DETECTADO SINTIENDO UN 'CRUJIDO' AL TOCAR. PUEDE HABER BURBUJAS DE GAS Y UNA L\u00CDNEA DE DEMARCACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0234", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0235", TEXT_BOTON : "\u00BFEDEMA DE LA LENGUA?", INFORMACION_PREGUNTA : "TUMEFACCI\u00D3N DE LA LENGUA EN CUALQUIER GRADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0236", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURPUR\u00C9O NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0237", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0238", TEXT_BOTON : "\u00BFRESPONDE SOLO A LA VOZ O AL DOLOR?", INFORMACION_PREGUNTA : "RESPUESTA A ESTUMULO DOLOROSO O A LA VEZ. PARA EL DOLOR SE PUEDEN UTILIZAR EST\u00CDMULOS PER\u00CDFERICOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0239", TEXT_BOTON : "\u00BFHIPOTONIA INFANTIL?", INFORMACION_PREGUNTA : "LOS PADRES DESCRIBEN A SU HIJO SIN FUERZA, FL\u00C1CIDO, TONO REDUCIDO DE FORMA GENERAL. EL SIGNO M\u00C1S LLAMATIVO ES LA INCAPACIDAD DE SOSTENER LA CABEZA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0240", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0241", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0242", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0243", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0244", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0245", TEXT_BOTON : "\u00BFP\u00C9RDIDA COMPLETA Y AGUDA DE LA VISI\u00D3N?", INFORMACION_PREGUNTA : "P\u00C9RDIDA DE VISI\u00D3N, EN UNO O AMBOS OJOS EN LAS 24 HORAS PREVIAS, QUE NO HA RETORNADO A LA NORMALIDAD.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0246", TEXT_BOTON : "\u00BFINMUNOSUPRESI\u00D3N CONOCIDA O PROBABLE?", INFORMACION_PREGUNTA : "CUALQUIER PACIENTE EN EL QUE SE CONOCE O SE PRESUME QUE EST\u00C1 INMUNODEPRIMIDO INCLUYENDO AQUELLOS QUE USAN DROGAS INMUNOSUPRESORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0247", TEXT_BOTON : "\u00BFLESI\u00D3N INHALATORIA?", INFORMACION_PREGUNTA : "ANTECEDENTE DE HABER ESTADO ENCERRADO EN UN LUGAR LLENO DE HUMO. PUEDEN ENCONTRARSE RESTOS DE CARB\u00D3N ALREDEDOR DE LA BOCA, NAR\u00CDZ Y VOZ RONCA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0248", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0249", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0250", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0251", TEXT_BOTON : "\u00BFEDEMA FACIAL?", INFORMACION_PREGUNTA : "HINCHAZ\u00D3N DIFUSA QUE AFECTA A LA CARA. NORMALMENTE INCLUYENDO LOS LABIOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0252", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0253", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0254", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0301", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0302", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0303", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0304", TEXT_BOTON : "\u00BFHISTORIA INADECUADA?", INFORMACION_PREGUNTA : "SI NO HAY UN ANTECEDENTE CLARO E INEQU\u00CDVOCO DE INGESTI\u00D3N AGUDA DE ALCOHOL, TRAUMATISMO CRANEOENCEF\u00C1LICO, INGESTI\u00D3N DE FROGAS O CONDICIONES M\u00C9DICAS SUBYACENTES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0305", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0306", TEXT_BOTON : "\u00BFFLUJO ESPIRATORIO PICO (FEP) MUY BAJO (<33% ESP)?", INFORMACION_PREGUNTA : "EL FLUJO ESPIRATORIO M\u00C1XIMO DEPENDE DE EDAD Y SEXO DEL PACIENTE. SE CUMPLE \u00C9STE CRITERIO SI EL VALOR MEDIDO ES MENOR AL 33% DEL ESPERADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0307", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0308", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0309", TEXT_BOTON : "\u00BFSIGNOS DE MENINGISMO?", INFORMACION_PREGUNTA : "RIGIDEZ EN LA NUCA JUNTO CON CEFALEA Y FOTOFOBIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0310", TEXT_BOTON : "\u00BFHISTORIA DE SOBREDOSIS Y/O ENVENENAMIENTO?", INFORMACION_PREGUNTA : "ESTA INFORMACI\u00D3N PUEDE OBTENERSE DE OTROS O PUEDE DEDUCIRSE SI FALTA MEDICACI\u00D3N EN SU \u00C1MBITO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0311", TEXT_BOTON : "\u00BFSIGNOS DE MENINGISMO?", INFORMACION_PREGUNTA : "RIGIDEZ EN LA NUCA JUNTO CON CEFALEA Y FOTOFOBIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0312", TEXT_BOTON : "\u00BFLESI\u00D3N PENETRANTE EN OJO?", INFORMACION_PREGUNTA : "TRAUMATUSMO F\u00CDSICO RECIENTE QUE PERFORA EL GLOBO OCULAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0313", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0314", TEXT_BOTON : "\u00BFFALLO AL REACCIONAR CON LOS PADRES?", INFORMACION_PREGUNTA : "FALLO EN LA REACCI\u00D3N , DE CUALQUIER FORMA, ANTE LA CARA O LA VOZ DE LOS PADRES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0315", TEXT_BOTON : "\u00BFAGOTAMIENTO?", INFORMACION_PREGUNTA : "LOS PACIENTES AGOTADOS PARECEN DISMINIUR EL ESFUERZO QUE HACEN PARA RESPIRAR A PESAR DE PERSISTIR LA INSIFUCIENCIA RESPIRATORIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0316", TEXT_BOTON : "\u00BFAUMENTO DEL TRABAJO RESPIRATORIO?", INFORMACION_PREGUNTA : "INCREMENTO DE LA FRECUENCIA RESPIRATORIA AL USO DE M\u00DASCULOS ACCESORIOS O A LA RESPIRACI\u00D3N RUIDOSA", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDN0317", TEXT_BOTON : "\u00BFSANGRADO VAGINAL EN GESTANTE DE 20 A M\u00C1S SEMANAS?", INFORMACION_PREGUNTA : "CUALQUIER SANGRADO VAGINAL EN UNA MUJER EMBARAZADA DE 20 SEMANAS O M\u00C1S-", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0318", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0319", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0320", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0321", TEXT_BOTON : "\u00BFRIESGO ESPECIAL DE INFECCI\u00D3N?", INFORMACION_PREGUNTA : "EXPOSICI\u00D3N CONOCIDA A UN PAT\u00D3GENO PELIGROSO, O VIAJE A UN \u00C1REA CON RIESGO SERIO DE INFECCI\u00D3N EN ESE MOMENTO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0322", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0323", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0324", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0326", TEXT_BOTON : "\u00BFRIESGO ALTO DE LESIONAR A OTROS?", INFORMACION_PREGUNTA : "POSIBILIDAD ALTA DE DA\u00D1AR A OTRAS. SE OBSERVA POSTURA DEL CUERPO TENSA, APRETANDO PU\u00D1OS, LENGUAJE CON GRITOS Y AMENAZANTE Y COMPORTAMIENTO MOTOR PASEANTE E INQUIETO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0327", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0328", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0329", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0330", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0331", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A ESTIMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0332", TEXT_BOTON : "\u00BFCOMPROMISO VASCULAR?", INFORMACION_PREGUNTA : "COMBINACI\u00D3N DE PALIDEZ, FRIALDAD, ALTERACI\u00D3N DE LA SENSIBILIDAD Y DOLOR, CON O SIN AUSENCIA DE PULSO DISTAL A LA LESI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0333", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0334", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0335", TEXT_BOTON : "\u00BFINCAPAZ DE DECIR FRASES?", INFORMACION_PREGUNTA : "PACIENTES QUE EST\u00C1N TAN DISN\u00C9ICOS QUE NO PUEDEN ARTICULAR UNA FRASE RELATICAMENTE CORTA DURANTE UNA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0336", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0337", TEXT_BOTON : "\u00BFRESPONDE SOLO A LA VOZ O AL DOLOR?", INFORMACION_PREGUNTA : "RESPUESTA A EST\u00CDMULO DOLOROSO O A LA VOZ. PARA EL DOLOR SE PUEDEN UTILIZAR EST\u00CDMULOS PER\u00CDFERICOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0338", TEXT_BOTON : "\u00BFSIGNOS DE MENINGISMO?", INFORMACION_PREGUNTA : "RIGIDEZ EN LA NUCA JUNTO CON CEFALEA Y FOTOFOBIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0339", TEXT_BOTON : "\u00BFRESPONDE SOLO A LA VOZ O AL DOLOR?", INFORMACION_PREGUNTA : "RESPUESTA A EST\u00CDMULO DOLOROSO O A LA VOZ. PARA EL DOLOR SE PUEDEN UTILIZAR EST\u00CDMULOS PER\u00CDFERICOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0340", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0341", TEXT_BOTON : "\u00BFCOMPROMISO VASCULAR?", INFORMACION_PREGUNTA : "COMBINACI\u00D3N DE PALIDEZ, FRIALDAD, ALTERACI\u00D3N DE LA SENSIBILIDAD Y DOLOR, CON O SIN AUSENCIA DE PULSO DISTAL A LA LESI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0342", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0343", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0344", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0345", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0346", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0347", TEXT_BOTON : "\u00BFDISNEA AGUDA?", INFORMACION_PREGUNTA : "DISNEA QUE SE ESTABLECE R\u00C1PIDAMENTE O EXACERBACI\u00D3N R\u00C1PIDA DE UNA DISNEA CR\u00D3NICA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0348", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0349", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0350", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0351", TEXT_BOTON : "\u00BFINCAPAZ DE DECIR FRASES?", INFORMACION_PREGUNTA : "PACIENTES QUE EST\u00C1N TAN DISN\u00C9ICOS QUE NO PUEDEN ARTICULAR UNA FRASE RELATICAMENTE CORTA DURANTE UNA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0352", TEXT_BOTON : "\u00BFRIESGO ALTO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES CON UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE LO HAN INTENTADO ACTIVAMENTE O ESTAN PRETENDIENDO HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0353", TEXT_BOTON : "\u00BFRESPONDE SOLO A LA VOZ O AL DOLOR?", INFORMACION_PREGUNTA : "RESPUESTA A EST\u00CDMULO DOLOROSO O A LA VOZ. PARA EL DOLOR SE PUEDEN UTILIZAR EST\u00CDMULOS PER\u00CDFERICOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0354", TEXT_BOTON : "\u00BFRESPONDE SOLO A LA VOZ O AL DOLOR?", INFORMACION_PREGUNTA : "RESPUESTA A EST\u00CDMULO DOLOROSO O A LA VOZ. PARA EL DOLOR SE PUEDEN UTILIZAR EST\u00CDMULOS PER\u00CDFERICOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0401", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0402", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0403", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0404", TEXT_BOTON : "\u00BFHIPOTERMIA (<35\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL EST\u00C1 FR\u00CDA AL TACTO, SE HABLA DE HIPOTERMIA. TEMPERATURA MENOR A 35\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0405", TEXT_BOTON : "\u00BFRIESGO ALTO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES CON UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE LO HAN INTENTADO ACTIVAMENTE O EST\u00C1N PRETENDIENDO HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0406", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0407", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0408", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0409", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURPUR\u00C9O NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0410", TEXT_BOTON : "\u00BFRIESGO ALTO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES CON UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE LO HAN INTENTADO ACTIVAMENTE O EST\u00C1N PRETENDIENDO HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0411", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0412", TEXT_BOTON : "\u00BFMECANISMO LESIONAL SIGNIFICATIVO?", INFORMACION_PREGUNTA : "SON SIGNIFICATIVAS O RELEVANTES  LAS HERIDAS PENETRANTES (PU\u00D1ALADA O DISPARO) Y LAS LESIONES CON ALTA TRANSFERENCIA DE ENERG\u00CDA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0413", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0414", TEXT_BOTON : "\u00BFV\u00D3MITO DE SANGRE?", INFORMACION_PREGUNTA : "V\u00D3MITO DE SANGRE QUE PUEDE SER FRESCA (BRILLANTE O ROJO OSCURO) O EN CUNCHO DE CAF\u00C9.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0415", TEXT_BOTON : "\u00BFFLUJO ESPIRATORIO PICO (FEP) MUY BAJO (<33% ESP)?", INFORMACION_PREGUNTA : "EL FLUJO ESPIRATORIO M\u00C1XIMO DEPENDE DE EDAD Y SEXO DEL PACIENTE. SE CUMPLE \u00C9STE CRITERIO SI EL VALOR MEDIDO ES MENOR AL 33% DEL ESPERADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0416", TEXT_BOTON : "\u00BFAGOTAMIENTO?", INFORMACION_PREGUNTA : "LOS PACIENTES AGOTADOS PARECEN DISMINIUR EL ESFUERZO QUE HACEN PARA RESPIRAR A PESAR DE PERSISTIR LA INSIFUCIENCIA RESPIRATORIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0417", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0418", TEXT_BOTON : "\u00BFEX\u00C1NTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0419", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0420", TEXT_BOTON : "\u00BFDOLOR ABDOMINAL?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE ABDOMEN. DOLOR ABDOMINAL IRRADIADO A ESPALDA PUEDE ESTAR ASOCIADO A ANEURISMA A\u00D3RTICO ABD. ASOCIADO A SANGRADO VAGINAL PUEDE INDICAR EMBARAZO ECT\u00D3PICO O ABORTO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0421", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0422", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0423", TEXT_BOTON : "\u00BFDOLOR CARD\u00CDACO?", INFORMACION_PREGUNTA : "CLASICAMENTE DOLOR INTENSO, SORDO, OPRESIVO O PESADO EN EL CENTRO DEL T\u00D3RAX, IRRADIADO A BRAZO IZQUIERDO O AL CUELLO. PUEDE ESTAR ASOCIADO A SUDORACI\u00D3N Y N\u00C1USEAS.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0424", TEXT_BOTON : "\u00BFPARTO ACTIVO?", INFORMACION_PREGUNTA : "MUJER QUE ESTA TENIENDO CONTRACCIONES DOLOROSAS, REGULARES Y FRECUENTES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0427", TEXT_BOTON : "\u00BFINMUNOSUPRESI\u00D3N CONOCIDA O PROBABLE?", INFORMACION_PREGUNTA : "CUALQUIER PACIENTE EN EL QUE SE CONOCE O SE PRESUME QUE EST\u00C1 INMUNODEPRIMIDO INCLUYENDO AQUELLOS QUE USAN DROGAS INMUNOSUPRESORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0428", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0429", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0430", TEXT_BOTON : "\u00BFHISTORIA DE SANGRADO GI SIGNIFICATIVO?", INFORMACION_PREGUNTA : "CUALQUIER HISTORIA DE HEMORRAGIA GI IMPORTANTE ASOCIADA A V\u00C1RICES ESOF\u00C1GICAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0431", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0432", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0433", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0434", TEXT_BOTON : "\u00BFEVISCERACI\u00D3N?", INFORMACION_PREGUNTA : "HERNIACI\u00D3N O SALIDA FRANCA DE \u00D3RGANOS INTERNOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0435", TEXT_BOTON : "\u00BFHEMORRAGIA MAYOR INCONTROLABLE?", INFORMACION_PREGUNTA : "HEMORRAGIA QUE NO SE PUEDE CONTROLAR R\u00C1PIDAMENTE CON LA APLICACI\u00D3N DIRECTA Y CONTINUA DE PRESI\u00D3N Y QUE SIGUE SANGRANDO DE MANERA IMPORTANTE. EMPAPA GRAN CANTIDAD DE COMPRESAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0436", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0437", TEXT_BOTON : "\u00BFFALLO AL REACCIONAR CON LOS PADRES?", INFORMACION_PREGUNTA : "FALLO EN LA REACCI\u00D3N , DE CUALQUIER FORMA, ANTE LA CARA O LA VOZ DE LOS PADRES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0438", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0439", TEXT_BOTON : "\u00BFFALLO AL REACCIONAR CON LOS PADRES?", INFORMACION_PREGUNTA : "FALLO EN LA REACCI\u00D3N , DE CUALQUIER FORMA, ANTE LA CARA O LA VOZ DE LOS PADRES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0440", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0441", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0442", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0444", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0445", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0446", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0447", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0448", TEXT_BOTON : "\u00BFLETALIDAD ALTA?", INFORMACION_PREGUNTA : "LETALIDAD ES EL POTENCIAL DE LA SUSTANCIA PARA CAUSAR DA\u00D1O, ENFERMEDAD GRAVE O MUERTE. PUEDE REQUIERRI INFORME DE TOXICOLOG\u00CDA PARA ESTABLECER NIVEL DE RIESGO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0449", TEXT_BOTON : "\u00BFMECANISMO LESIONAL SIGNIFICATIVO?", INFORMACION_PREGUNTA : "SON SIGNIFICATIVAS O RELEVANTES  LAS HERIDAS PENETRANTES (PU\u00D1ALADA O DISPARO) Y LAS LESIONES CON ALTA TRANSFERENCIA DE ENERG\u00CDA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0450", TEXT_BOTON : "\u00BFHISTORIA DE SOBREDOSIS Y/O ENVENENAMIENTO?", INFORMACION_PREGUNTA : "ESTA INFORMACI\u00D3N PUEDE OBTENERSE DE OTROS O PUEDE DEDUCIRSE SI FALTA MEDICACI\u00D3N EN SU \u00C1MBITO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0451", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0452", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0453", TEXT_BOTON : "\u00BFFALLO AL REACCIONAR CON LOS PADRES?", INFORMACION_PREGUNTA : "FALLO EN LA REACCI\u00D3N , DE CUALQUIER FORMA, ANTE LA CARA O LA VOZ DE LOS PADRES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0454", TEXT_BOTON : "\u00BFFALLO AL REACCIONAR CON LOS PADRES?", INFORMACION_PREGUNTA : "FALLO EN LA REACCI\u00D3N , DE CUALQUIER FORMA, ANTE LA CARA O LA VOZ DE LOS PADRES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0501", TEXT_BOTON : "\u00BFSIGNOS DE MENINGISMO?", INFORMACION_PREGUNTA : "RIGIDEZ EN LA NUCA JUNTO CON CEFALEA Y FOTOFOBIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0502", TEXT_BOTON : "\u00BFNUEVO D\u00C9FICIT NEUROL\u00D3GICO DE MENOS DE 24H?", INFORMACION_PREGUNTA : "CUALQUIER D\u00C9FICIT NEUROL\u00D3GICO QUE HAYA COMENZADO EN LAS 24 HORAS PREVIAS. INCLUYE P\u00C9RDIDA O ALT. DE SENSIBILIDAD, DEBILIDAD MIEMBROS (TRANSITORIO O PERMANENTE) Y ALT. MICCI\u00D3N/DEFECACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0503", TEXT_BOTON : "\u00BFMECANISMO LESIONAL SIGNIFICATIVO?", INFORMACION_PREGUNTA : "SON SIGNIFICATIVAS O RELEVANTES  LAS HERIDAS PENETRANTES (PU\u00D1ALADA O DISPARO) Y LAS LESIONES CON ALTA TRANSFERENCIA DE ENERG\u00CDA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0505", TEXT_BOTON : "\u00BFMECANISMO DE LESI\u00D3N SIGNIFICATIVO?", INFORMACION_PREGUNTA : "SON SIGNIFICATIVAS O RELEVANTES  LAS HERIDAS PENETRANTES (PU\u00D1ALADA O DISPARO) Y LAS LESIONES CON ALTA TRANSFERENCIA DE ENERG\u00CDA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0506", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0507", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0508", TEXT_BOTON : "\u00BFMECANISMO LESIONA SIGNIFICATIVO?", INFORMACION_PREGUNTA : "SON SIGNIFICATIVAS O RELEVANTES  LAS HERIDAS PENETRANTES (PU\u00D1ALADA O DISPARO) Y LAS LESIONES CON ALTA TRANSFERENCIA DE ENERG\u00CDA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0509", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0510", TEXT_BOTON : "\u00BFRIESGO ALTO DE LESIONAR A OTROS?", INFORMACION_PREGUNTA : "POSIBILIDAD ALTA DE DA\u00D1AR A OTRAS. SE OBSERVA POSTURA DEL CUERPO TENSA, APRETANDO PU\u00D1OS, LENGUAJE CON GRITOS Y AMENAZANTE Y COMPORTAMIENTO MOTOR PASEANTE E INQUIETO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0511", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0512", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0513", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0514", TEXT_BOTON : "\u00BFEMISI\u00D3N AGUDA SANGRE FRESCA/ALT. POR V\u00CDA RECTAL?", INFORMACION_PREGUNTA : "EN LA HEMORRAGIA G.I. ACTIVA Y MASIVA, SALDR\u00C1 SANGRE ROJA OSCURA POR V\u00CDA RECTAL. A MEDIDA QUE EL TIEMPO DE TR\u00C1NSITO GI AUMENTA LA SANGRE SE PONE M\u00C1S OSCURA, CONVIRTI\u00C9NDOSE EN MELENAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0515", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0516", TEXT_BOTON : "\u00BFFLUJO ESPIRATORIO PICO (FEP) MUY BAJO (<33% ESP)?", INFORMACION_PREGUNTA : "EL FLUJO ESPIRATORIO M\u00C1XIMO DEPENDE DE EDAD Y SEXO DEL PACIENTE. SE CUMPLE \u00C9STE CRITERIO SI EL VALOR MEDIDO ES MENOR AL 33% DEL ESPERADO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0517", TEXT_BOTON : "\u00BFDOLOR IRRADIADO HACIA LA ESPALDA?", INFORMACION_PREGUNTA : "DOLOR QUE TAMBI\u00C9N AFECTA A LA ESPALDA, INTERMINTENTE O CONTINUO.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0518", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0519", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0520", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0521", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0522", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0523", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0524", TEXT_BOTON : "\u00BFHISTORIA DE CONVULSIONES?", INFORMACION_PREGUNTA : "CUALQUIER CONVULSI\u00D3N OBSERVADA O MANIFESTADA QUE HAYA OCURRIDO DURANTE PERIODO DE ENFERNEDAD O TRAS UN EPISODIO TRAUM\u00C1TICO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0527", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0528", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0529", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0530", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0531", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0532", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0533", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0534", TEXT_BOTON : "\u00BFMECANIMOS LESIONAL SIGNIFICATIVO?", INFORMACION_PREGUNTA : "SON SIGNIFICATIVAS O RELEVANTES  LAS HERIDAS PENETRANTES (PU\u00D1ALADA O DISPARO) Y LAS LESIONES CON ALTA TRANSFERENCIA DE ENERG\u00CDA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0535", TEXT_BOTON : "\u00BFSATURACI\u00D3N DE OX\u00CDGENO MUY BAJA (<92% AMBIENTE)?", INFORMACION_PREGUNTA : "CUALQUIER SATURACI\u00D3N MENOR AL 95% CON OXIGENOTERAPIA O 92% AMBIENTE.", TIPO_PREGUNTA : "6"},
                       {PREGUNTA : "IDN0536", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0537", TEXT_BOTON : "\u00BFSIGNOS DE MENINGISMO?", INFORMACION_PREGUNTA : "RIGIDEZ EN LA NUCA JUNTO CON CEFALEA Y FOTOFOBIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0538", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0539", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0540", TEXT_BOTON : "\u00BFMECANISMO LESIONAL SIGNIFICATIVO?", INFORMACION_PREGUNTA : "SON SIGNIFICATIVAS O RELEVANTES  LAS HERIDAS PENETRANTES (PU\u00D1ALADA O DISPARO) Y LAS LESIONES CON ALTA TRANSFERENCIA DE ENERG\u00CDA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0541", TEXT_BOTON : "\u00BFESTADO CRITICO DE LA PIEL?", INFORMACION_PREGUNTA : "EN LA FRACTURA O LUXACI\u00D3N PUEDEN EXISTIR FRAGMENTOS O EXTREMOS \u00D3SEOS QUE HAGAN PRESI\u00D3N INTENSA SOBRE LA PIEL COMPROMETIENDO SU VIABILIDAD. LA PIEL APARECER\u00C1 BLANCA Y A TENSI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0542", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0544", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0545", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.       ", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0546", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0547", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0548", TEXT_BOTON : "\u00BFRIESGO ALTO DE AUTOLESI\u00D3N?", INFORMACION_PREGUNTA : "PACIENTES CON UN ANTECEDENTE SIGNIFICATIVO DE AUTOLESI\u00D3N, QUE LO HAN INTENTADO ACTIVAMENTE O EST\u00C1N PRETENDIENDO HACERLO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0549", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0550", TEXT_BOTON : "\u00BFDOLOR CARD\u00CDACO?", INFORMACION_PREGUNTA : "CLASICAMENTE DOLOR INTENSO, SORDO, OPRESIVO O PESADO EN EL CENTRO DEL T\u00D3RAX, IRRADIADO A BRAZO IZQUIERDO O AL CUELLO. PUEDE ESTAR ASOCIADO A SUDORACI\u00D3N Y N\u00C1USEAS.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0551", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0553", TEXT_BOTON : "\u00BFSIGNOS DE MENINGISMO?", INFORMACION_PREGUNTA : "RIGIDEZ EN LA NUCA JUNTO CON CEFALEA Y FOTOFOBIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0554", TEXT_BOTON : "\u00BFSIGNOS DE MENINGISMO?", INFORMACION_PREGUNTA : "RIGIDEZ EN LA NUCA JUNTO CON CEFALEA Y FOTOFOBIA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0601", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0602", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0603", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0605", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0606", TEXT_BOTON : "\u00BFHISTORIA RESPIRATORIA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "ANTECEDENTE  DE EPISODIOS RESPIRATORIOS GRAVES (EJ. EPOC) AS\u00CD COMO EL ASMA", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0607", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0608", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0609", TEXT_BOTON : "\u00BFCOMIENZO BRUSCO?", INFORMACION_PREGUNTA : "COMIENZO EN SEGUNDO O MINUTOS, PUEDE CAUSAR INTERRUPCI\u00D3N DEL SUE\u00D1O.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0611", TEXT_BOTON : "\u00BFHISTORIA DE SOBREDOSIS Y/O ENVENENAMIENTO?", INFORMACION_PREGUNTA : "ESTA INFORMACI\u00D3N PUEDE OBTENERSE DE OTROS O PUEDE DEDUCIRSE SI FALTA MEDICACI\u00D3N EN SU \u00C1MBITO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0613", TEXT_BOTON : "\u00BFHIPOTERMIA (<35\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL EST\u00C1 FR\u00CDA AL TACTO, SE HABLA DE HIPOTERMIA. TEMPERATURA MENOR A 35\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0614", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0615", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0616", TEXT_BOTON : "\u00BFPULSO AN\u00D3MALO NUEVO?", INFORMACION_PREGUNTA : "BRADICARDIA (MENOS DE 60P/MIN), TAQUICARDIA (M\u00C1S DE 100P/MIN) O UN RITMO IRREGULAR. LOS VALORES DEPENDEN DE LA EDAD.", TIPO_PREGUNTA : "2"},
                       {PREGUNTA : "IDN0617", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0618", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0619", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0621", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0624", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0627", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0628", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0629", TEXT_BOTON : "\u00BFLETALIDAD ALTA DE AGENTE QU\u00CDMICO?", INFORMACION_PREGUNTA : "LETALIDAD ES LA CAPACIDAD DE UN AGENTE QU\u00CDMICO DE CAUSAR DA\u00D1O. PUEDE SER NECESARIA INFORMACI\u00D3N TOXICOL\u00D3GICA AUTORIZADA PARA ESTABLECER EL NIVEL DEL RIESGO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0632", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0634", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0635", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0636", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0637", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0638", TEXT_BOTON : "\u00BFHISTORIA DE SOBREDOSIS Y/O ENVENENAMIENTO?", INFORMACION_PREGUNTA : "ESTA INFORMACI\u00D3N PUEDE OBTENERSE DE OTROS O PUEDE DEDUCIRSE SI FALTA MEDICACI\u00D3N EN SU \u00C1MBITO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0639", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0640", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0641", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0644", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0647", TEXT_BOTON : "\u00BFLETALIDAD ALTA POR AGENTE QU\u00CDMICO?", INFORMACION_PREGUNTA : "LETALIDAD ES LA CAPACIDAD DE UN AGENTE QU\u00CDMICO DE CAUSAR DA\u00D1O. PUEDE SER NECESARIA INFORMACI\u00D3N TOXICOL\u00D3GICA AUTORIZADA PARA ESTABLECER EL NIVEL DEL RIESGO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0650", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0651", TEXT_BOTON : "\u00BFNIVEL DE CONSCIENCIA ALTERADA?", INFORMACION_PREGUNTA : "NO TOTALMENTE ALERTA. RESPONDE SOLO A EST\u00CDMULOS VERBALES O DOLOROSOS O NO RESPONDE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0653", TEXT_BOTON : "\u00BFPURPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0654", TEXT_BOTON : "\u00BFP\u00DARPURA?", INFORMACION_PREGUNTA : "EXANTEMA EN CUALQUIER PARTE DEL CUERPO CAUSADO POR PEQUE\u00D1AS HEMORRAGIAS BAJO LA PIEL UN EXANTEMA PURP\u00DAREO NO PALIDECE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0701", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0702", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0706", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0707", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0708", TEXT_BOTON : "\u00BFHIPOTERMIA (<35\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL EST\u00C1 FRIA AL TACTO, SE HABLA DE HIPOTERMIA. TEMPERATURA MENOR A 35\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0709", TEXT_BOTON : "\u00BFP\u00C9RDIDA COMPLETA Y AGUDA DE LA VISI\u00D3N?", INFORMACION_PREGUNTA : "P\u00C9RDIDA DE VISI\u00D3N, EN UNO O AMBOS OJOS EN LAS 24 HORAS PREVIAS, QUE NO HA RETORNADO A LA NORMALIDAD.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0711", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0714", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0715", TEXT_BOTON : "\u00BFHISTORIA RESPIRATORIA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "ANTECEDENTE  DE EPISODIOS RESPIRATORIOS GRAVES (EJ. EPOC) AS\u00CD COMO EL ASMA", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0716", TEXT_BOTON : "\u00BFRESPONDE SOLO A LA VOZ O AL DOLOR?", INFORMACION_PREGUNTA : "RESPUESTA A ESTUMULO DOLOROSO O A LA VEZ. PARA EL DOLOR SE PUEDEN UTILIZAR EST\u00CDMULOS PER\u00CDFERICOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0718", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0724", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0728", TEXT_BOTON : "\u00BFHISTORIA DE ALERGIA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "SE CONSIDERA SIGNIFICATIVA UNA HIPERSENSIBILIDAD CONOCIDA CON ANTECEDENTES PREVIOS DE REACCI\u00D3N GRAVE. (PICADURA DE ABEJA O ALERGIA A NUECES).", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0729", TEXT_BOTON : "\u00BFRIESGO DE CONTAMINACI\u00D3N CONTINUADA?", INFORMACION_PREGUNTA : "PERSISTENCIA DE EXPOSICI\u00D3N A UN PRODUCTO QU\u00CDMICO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0735", TEXT_BOTON : "\u00BFLETALIDAD ALTA POR ENVENENAMIENTO?", INFORMACION_PREGUNTA : "LETALIDAD ES EL POTENCIAL DEL VENENO PARA CAUSAR DA\u00D1O, ENFERMEDAD GRAVE O MUERTE. EL CONOCIMIENTO LOCAL PUEDE PERMITIR LA IDENTIFICACI\u00D3N DEL AGENTE, PUEDE SER NECESARIO CONCENSO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0737", TEXT_BOTON : "\u00BFINMUNOSUPRESI\u00D3N CONOCIDA O PROBABLE?", INFORMACION_PREGUNTA : "CUALQUIER PACIENTE EN EL QUE SE CONOCE O SE PRESUME QUE EST\u00C1 INMUNODEPRIMIDO INCLUYENDO AQUELLOS QUE USAN DROGAS INMUNOSUPRESORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0738", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0739", TEXT_BOTON : "\u00BFHISTORIA DE SOBREDOSIS Y/O ENVENENAMIENTO?", INFORMACION_PREGUNTA : "ESTA INFORMACI\u00D3N PUEDE OBTENERSE DE OTROS O PUEDE DEDUCIRSE SI FALTA MEDICACI\u00D3N EN SU \u00C1MBITO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0747", TEXT_BOTON : "\u00BFMECANISMO LESIONAL SIGNIFICATIVO?", INFORMACION_PREGUNTA : "SON SIGNIFICATIVAS O RELEVANTES  LAS HERIDAS PENETRANTES (PU\u00D1ALADA O DISPARO) Y LAS LESIONES CON ALTA TRANSFERENCIA DE ENERG\u00CDA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0751", TEXT_BOTON : "\u00BFHISTORIA DE ALERGIA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "SE CONSIDERA SIGNIFICATIVA UNA HIPERSENSIBILIDAD CONOCIDA CON ANTECEDENTES PREVIOS DE REACCI\u00D3N GRAVE. (PICADURA DE ABEJA O ALERGIA A NUECES).", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0753", TEXT_BOTON : "\u00BFINMUNOSUPRESI\u00D3N CONOCIDA O PROBABLE?", INFORMACION_PREGUNTA : "CUALQUIER PACIENTE EN EL QUE SE CONOCE O SE PRESUME QUE EST\u00C1 INMUNODEPRIMIDO INCLUYENDO AQUELLOS QUE USAN DROGAS INMUNOSUPRESORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0754", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0801", TEXT_BOTON : "\u00BFINMUNOSUPRESI\u00D3N CONOCIDA O PROBABLE?", INFORMACION_PREGUNTA : "CUALQUIER PACIENTE EN EL QUE SE CONOCE O SE PRESUME QUE EST\u00C1 INMUNODEPRIMIDO INCLUYENDO AQUELLOS QUE USAN DROGAS INMUNOSUPRESORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0802", TEXT_BOTON : "\u00BFHISTORIA DE ALERGIA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "SE CONSIDERA SIGNIFICATIVA UNA HIPERSENSIBILIDAD CONOCIDA CON ANTECEDENTES PREVIOS DE REACCI\u00D3N GRAVE. (PICADURA DE ABEJA O ALERGIA A NUECES).", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0808", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0809", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0811", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0814", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0815", TEXT_BOTON : "\u00BFCOMIENZO AGUDO POSTRAUM\u00C1TICO?", INFORMACION_PREGUNTA : "S\u00CDNTOMAS QUE SE PRESENTAN EN LAS 24H DESPU\u00C9S DE UN TRAUMA F\u00CDSICO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0816", TEXT_BOTON : "\u00BFHISTORIA RESPIRATORIA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "ANTECEDENTE  DE EPISODIOS RESPIRATORIOS GRAVES (EJ. EPOC) AS\u00CD COMO EL ASMA", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0828", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0829", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0835", TEXT_BOTON : "\u00BFHISTORIA DE ALERGIA SIGNIFICATIVA?", INFORMACION_PREGUNTA : "SE CONSIDERA SIGNIFICATIVA UNA HIPERSENSIBILIDAD CONOCIDA CON ANTECEDENTES PREVIOS DE REACCI\u00D3N GRAVE. (PICADURA DE ABEJA O ALERGIA A NUECES).", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0837", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0838", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0839", TEXT_BOTON : "\u00BFINMUNOSUPRESI\u00D3N CONOCIDA O PROBABLE?", INFORMACION_PREGUNTA : "CUALQUIER PACIENTE EN EL QUE SE CONOCE O SE PRESUME QUE EST\u00C1 INMUNODEPRIMIDO INCLUYENDO AQUELLOS QUE USAN DROGAS INMUNOSUPRESORAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0847", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0851", TEXT_BOTON : "\u00BFPICOR MUY INTENSO O DOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "PRURITO INSOPORTABLE.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0853", TEXT_BOTON : "\u00BFEXANTEMA PETEQUIAL?", INFORMACION_PREGUNTA : "CUALQUIER EXANTEMA QUE NO PALIDECE CUANDO SE APLICA PRESI\u00D3N SOBRE \u00C9L.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0854", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0901", TEXT_BOTON : "\u00BFRIESGO ESPECIAL DE INFECCI\u00D3N?", INFORMACION_PREGUNTA : "EXPOSICI\u00D3N CONOCIDA A UN PAT\u00D3GENO PELIGROSO, O VIAJE A UN \u00C1REA CON RIESGO SERIO DE INFECCI\u00D3N EN ESE MOMENTO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0902", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0909", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0915", TEXT_BOTON : "\u00BFDOLOR CARD\u00CDACO?", INFORMACION_PREGUNTA : "CLASICAMENTE DOLOR INTENSO, SORDO, OPRESIVO O PESADO EN EL CENTRO DEL T\u00D3RAX, IRRADIADO A BRAZO IZQUIERDO O AL CUELLO. PUEDE ESTAR ASOCIADO A SUDORACI\u00D3N Y N\u00C1USEAS.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN0916", TEXT_BOTON : "\u00BFCOMIENZO AGUDO POSTRAUM\u00C1TICO?", INFORMACION_PREGUNTA : "S\u00CDNTOMAS QUE SE PRESENTAN EN LAS 24H DESPU\u00C9S DE UN TRAUMA F\u00CDSICO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDN0928", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0935", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0937", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0939", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0953", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN0954", TEXT_BOTON : "\u00BFHIPOTERMIA (<35\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL EST\u00C1 FR\u00CDA AL TACTO, SE HABLA DE HIPOTERMIA. TEMPERATURA MENOR A 35\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1001", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1002", TEXT_BOTON : "\u00BFHIPOTERMIA (<35\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL EST\u00C1 FR\u00CDA AL TACTO, SE HABLA DE HIPOTERMIA. TEMPERATURA MENOR A 35\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1015", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1016", TEXT_BOTON : "\u00BFBEB\u00C9 CON FIEBRE (38,5\u00B0C - 41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL PARECE CALIENTE SE CONSIDERA FIEBRE ALTA. FIEBRE ALTA TEMPERATURA MAYOR O IGUAL A 38,5\u00B0C. BEB\u00C9 NI\u00D1O MENOR DE 1A\u00D1O.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1028", TEXT_BOTON : "\u00BFPICOR MUY INTENSO O DOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "PRURITO INSOPORTABLE.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN1035", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1037", TEXT_BOTON : "\u00BFHIPOTERMIA (<35\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL EST\u00C1 FR\u00CDA AL TACTO, SE HABLA DE HIPOTERMIA. TEMPERATURA MENOR A 35\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1039", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1053", TEXT_BOTON : "\u00BFHIPOTERMIA (<35\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL EST\u00C1 FR\u00CDA AL TACTO, SE HABLA DE HIPOTERMIA. TEMPERATURA MENOR A 35\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1054", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN1101", TEXT_BOTON : "\u00BFHIPOTERMIA (<35\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL EST\u00C1 FR\u00CDA AL TACTO, SE HABLA DE HIPOTERMIA. TEMPERATURA MENOR A 35\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1102", TEXT_BOTON : "\u00BFDOLOR CARD\u00CDACO?", INFORMACION_PREGUNTA : "CLASICAMENTE DOLOR INTENSO, SORDO, OPRESIVO O PESADO EN EL CENTRO DEL T\u00D3RAX, IRRADIADO A BRAZO IZQUIERDO O AL CUELLO. PUEDE ESTAR ASOCIADO A SUDORACI\u00D3N Y N\u00C1USEAS.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN1115", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1116", TEXT_BOTON : "\u00BFHIPERTERMIA (<41\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL SE SIENTE MUY CALIENTE, SE CONSIDERA HIPERTERMIA. TEMPERATURA MAYOR A 41\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDN1135", TEXT_BOTON : "\u00BFPICOR MUY INTENSO O DOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "PRURITO INSOPORTABLE.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN1137", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN1139", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN1153", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN1201", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDN1202", TEXT_BOTON : "\u00BFDOLOR MUY INTENSO (EVA 8-10)?", INFORMACION_PREGUNTA : "DOLOR INSOPORTABLE A MENUDO DESCRITO POR EL PACIENTE COMO EL PEOR QUE JAM\u00C1S HA TENIDO. EVA 8 - 10.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDR0101", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0102", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0103", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0104", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0105", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0106", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0107", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0108", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0109", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0110", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0111", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0112", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0113", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0114", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0115", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0116", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0117", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0118", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0119", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0120", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0121", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0122", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0123", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0124", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0126", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0127", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0128", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0129", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0130", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0131", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0132", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0133", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0134", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0135", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0136", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0137", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0138", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0139", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0140", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0141", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0142", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0143", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0144", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0145", TEXT_BOTON : "\u00BFLESI\u00D3N QU\u00CDMICA AGUDA OCULAR?", INFORMACION_PREGUNTA : "CUALQUIER SALPICADURA O ENTRADA DE SUSTANCIA QU\u00CDMICA EN EL OJO EN LAS 12H PREVIAS, QUE PROVOQUE PR\u00DARITO, QUEMAZ\u00D3N O REDUCCI\u00D3N DE LA AGUDEZA VISUAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0146", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0147", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0148", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0149", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0150", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0151", TEXT_BOTON : "\u00BFV�A A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0152", TEXT_BOTON : "\u00BFVIA AEREA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0153", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0154", TEXT_BOTON : "\u00BFV\u00CDA A\u00C9REA COMPROMETIDA?", INFORMACION_PREGUNTA : "V\u00CDA QUE NO SE PUEDE MANTENER PERMEABLE O SI NO SE MANTIENEN LOS REFLEJOS PROTECTORES DE LA MISMA.  SE ESCUCHAN RONQUIDOS O RUIDOS EXTRA\u00D1OS DURANTE LA RESPIRACI\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0201", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0202", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0203", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0204", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0205", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0206", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0207", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0208", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0209", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0210", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0211", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0212", TEXT_BOTON : "\u00BFESTRIDOR?", INFORMACION_PREGUNTA : "PUEDE SER UN RUIDO INSPIRATORIO O ESPIRATORIO O AMBOS. EL ESTRIDOR SE OYE MEJOR CUANDO SE RESPIRA CON LA BOCA ABIERTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0213", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0214", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0215", TEXT_BOTON : "\u00BFESTRIDOR?", INFORMACION_PREGUNTA : "PUEDE SER UN RUIDO INSPIRATORIO O ESPIRATORIO O AMBOS. EL ESTRIDOR SE OYE MEJOR CUANDO SE RESPIRA CON LA BOCA ABIERTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0216", TEXT_BOTON : "\u00BFESTRIDOR?", INFORMACION_PREGUNTA : "PUEDE SER UN RUIDO INSPIRATORIO O ESPIRATORIO O AMBOS. EL ESTRIDOR SE OYE MEJOR CUANDO SE RESPIRA CON LA BOCA ABIERTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0217", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0218", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0219", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0220", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0221", TEXT_BOTON : "\u00BFESTRIDOR?", INFORMACION_PREGUNTA : "PUEDE SER UN RUIDO INSPIRATORIO O ESPIRATORIO O AMBOS. EL ESTRIDOR SE OYE MEJOR CUANDO SE RESPIRA CON LA BOCA ABIERTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0222", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0223", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0224", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0226", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0227", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0228", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0229", TEXT_BOTON : "\u00BFESTRIDOR?", INFORMACION_PREGUNTA : "PUEDE SER UN RUIDO INSPIRATORIO O ESPIRATORIO O AMBOS. EL ESTRIDOR SE OYE MEJOR CUANDO SE RESPIRA CON LA BOCA ABIERTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0230", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0231", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0232", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0233", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0234", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0235", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0236", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0237", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0238", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0239", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0240", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0241", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0242", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0243", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0244", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0246", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0247", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0248", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0249", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0250", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0251", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0252", TEXT_BOTON : "\u00BFRESPIRACION INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0253", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0254", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0301", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0302", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0303", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0304", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0305", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0306", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0307", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0308", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0309", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0310", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0311", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0312", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0313", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0314", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0315", TEXT_BOTON : "\u00BFBABEO?", INFORMACION_PREGUNTA : "SALIVA CAYENDO DESDE LA BOCA COMO CONSECUENCIA DE IMPOSIBILIDAD PARA TRAGAR", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0316", TEXT_BOTON : "\u00BFBABEO?", INFORMACION_PREGUNTA : "SALIVA CAYENDO DESDE LA BOCA COMO CONSECUENCIA DE IMPOSIBILIDAD PARA TRAGAR", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0317", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0318", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0319", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0320", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0321", TEXT_BOTON : "\u00BFBABEO?", INFORMACION_PREGUNTA : "SALIVA CAYENDO DESDE LA BOCA COMO CONSECUENCIA DE IMPOSIBILIDAD PARA TRAGAR", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0322", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0323", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0324", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00CDNICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0326", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0327", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0328", TEXT_BOTON : "\u00BFESTRIDOR?", INFORMACION_PREGUNTA : "PUEDE SER UN RUIDO INSPIRATORIO O ESPIRATORIO O AMBOS. EL ESTRIDOR SE OYE MEJOR CUANDO SE RESPIRA CON LA BOCA ABIERTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0329", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0330", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0331", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0332", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0333", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0334", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0335", TEXT_BOTON : "\u00BFESTRIDOR?", INFORMACION_PREGUNTA : "PUEDE SER UN RUIDO INSPIRATORIO O ESPIRATORIO O AMBOS. EL ESTRIDOR SE OYE MEJOR CUANDO SE RESPIRA CON LA BOCA ABIERTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0336", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0337", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0338", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0339", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0340", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0341", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0342", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0343", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0344", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0346", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0347", TEXT_BOTON : "\u00BFESTRIDOR?", INFORMACION_PREGUNTA : "PUEDE SER UN RUIDO INSPIRATORIO O ESPIRATORIO O AMBOS. EL ESTRIDOR SE OYE MEJOR CUANDO SE RESPIRA CON LA BOCA ABIERTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0348", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0349", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0350", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0351", TEXT_BOTON : "\u00BFESTRIDOR?", INFORMACION_PREGUNTA : "PUEDE SER UN RUIDO INSPIRATORIO O ESPIRATORIO O AMBOS. EL ESTRIDOR SE OYE MEJOR CUANDO SE RESPIRA CON LA BOCA ABIERTA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0352", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0353", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0354", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0401", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0402", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0403", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0404", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0405", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0406", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0407", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0408", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0409", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0410", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0411", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0412", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0413", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES NI DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0414", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0415", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0416", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0421", TEXT_BOTON : "\u00BFRESPIRACI\u00D3N INADECUADA?", INFORMACION_PREGUNTA : "PACIENTES QUE SON INCAPACES DE RESPIRAR ADECUADAMENTE PARA MANTENER UNA \u00D3PTIMA OXIGENACI\u00D3N. SE OBSERVA AUMENTO DEL TRABAJO RESPIRATORIO, RESP. INADECUADA O AGOTAMIENTO.", TIPO_PREGUNTA : "5"},
                       {PREGUNTA : "IDR0424", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0426", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0428", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0429", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0430", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0431", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0432", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0434", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0435", TEXT_BOTON : "\u00BFHEMORRAGIA DESANGRANTE?", INFORMACION_PREGUNTA : "SANGRADO DE TAL INTENSIDAD QUE LLEVAR\u00C1 A LA MUERTE SI NO SE CONSIGUE PARAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0437", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "PACIENTE QUE NO RESPONDE A EST\u00CDMULOS VERBALES NI DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0438", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "PACIENTE QUE NO RESPONDE A EST\u00CDMULOS VERBALES NI DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0439", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "PACIENTE QUE NO RESPONDE A EST\u00CDMULOS VERBALES NI DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0440", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0441", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0442", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0444", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0446", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0447", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0448", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0449", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0451", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0452", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0453", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0454", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES NI DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0501", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0502", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0503", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0504", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0508", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0509", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0510", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0511", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0512", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0513", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0515", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0516", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0521", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0524", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0528", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0529", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0530", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0531", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0534", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0535", TEXT_BOTON : "\u00BFSHOCK?", INFORMACION_PREGUNTA : "SHOCK ES LA INADECUADA DISTRIBUCI\u00D3N DE OX\u00CDGENO A LOS L\u00CDQUIDOS, SIGNOS CL\u00C1SICOS SON SUDORACI\u00D3N, PALIDEZ, TAQUICARDIA, HIPOTENSI\u00D3N, DISMINUCI\u00D3N EN EL NIVEL DE CONSCIENCIA.", TIPO_PREGUNTA : "11"},
                       {PREGUNTA : "IDR0537", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0538", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0540", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0544", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0547", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0548", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0549", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0551", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0553", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0554", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0604", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0608", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0611", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0612", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0616", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0621", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0624", TEXT_BOTON : "\u00BFNI\u00D1O QUE NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0629", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0635", TEXT_BOTON : "\u00BFNI\u00D1O NO RESPONDE?", INFORMACION_PREGUNTA : "NI\u00D1O QUE NO RESPONDE A EST\u00CDMULOS VERBALES O DOLOROSOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0637", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0648", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0649", TEXT_BOTON : "\u00BFCRISIS CONVULSIVA?", INFORMACION_PREGUNTA : "PACIENTE QUE EN EL MOMENTO DE LA VALORACI\u00D3N SE ENCUENTRA EN ESTADO T\u00D3NICO O CL\u00D3NICO DE GRAN MAL O QUE PRESENTA CONVULSIONES PARCIALES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0653", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0654", TEXT_BOTON : "\u00BFHIPOGLUCEMIA (<50MG/DL)?", INFORMACION_PREGUNTA : "GLUCOSA MENOR DE 50MG/DL (3MMOL/L)", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0724", TEXT_BOTON : "\u00BFPROLAPSO DE CORD\u00D3N UMBILICAL?", INFORMACION_PREGUNTA : "SALIDA DE CUALQUIER PARTE DEL CORD\u00D3N UMBILICAL A TRAV\u00C9S DEL C\u00C9RVIX.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0729", TEXT_BOTON : "\u00BFLESI\u00D3N QU\u00CDMICA AGUDA OCULAR?", INFORMACION_PREGUNTA : "CUALQUIER SALPICADURA O ENTRADA DE SUSTANCIA QU\u00CDMICA EN EL OJO EN LAS 12H PREVIAS, QUE PROVOQUE PR\u00DARITO, QUEMAZ\u00D3N O REDUCCI\u00D3N DE LA AGUDEZA VISUAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDR0824", TEXT_BOTON : "\u00BFPRESENTACI\u00D3N DE PARTES FETALES?", INFORMACION_PREGUNTA : "CORONACI\u00D3N O PRESENCIA DE CUALQUIER PARTE FETAL EN LA VAGINA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0101", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0102", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0103", TEXT_BOTON : "\u00BFDEFORMIDAD?", INFORMACION_PREGUNTA : "SIEMPRE ES SUBJETIVO; ANGULACI\u00D3N O ROTACI\u00D3N ANORMAL VISIBLE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0104", TEXT_BOTON : "\u00BFLESI\u00D3N RECIENTE?", INFORMACION_PREGUNTA : "CUALQUIER LESI\u00D3N PRODUCIDA EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0105", TEXT_BOTON : "NINGUNA DE LAS ANTERIORES", INFORMACION_PREGUNTA : "NINGUNA DE LAS ANTERIORES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0106", TEXT_BOTON : "\u00BFSIBILANCIAS?", INFORMACION_PREGUNTA : "SIBILANCIAS AUDIBLES O A LA AUSCULTACI\u00D3N.  UNA OBSTRUCCI\u00D3N IMPORANTE DE LA V\u00CDA A\u00C9REA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0107", TEXT_BOTON : "\u00BFCOMPORTAMIENTO INFANTIL AT\u00CDPICO?", INFORMACION_PREGUNTA : "NI\u00D1O QUE SE COMPORTA DE FORMA DIFERENTE A LA NORMAL. PADRES O CUIDADORES APORTAN ESTA INFORMACI\u00D3N ESPONT\u00C1NEAMENTE. ESTOS NI\u00D1OS A MENUDO SON ETIQUETADOS COMO REBELDES O IRRITABLES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0108", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0109", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0110", TEXT_BOTON : "NINGUNO DE LOS ANTERIORES", INFORMACION_PREGUNTA : "NINGUNA DE LAS CAUSAS ANTERIORES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0111", TEXT_BOTON : "\u00BFCEFALEA?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR EN LA CABEZA QUE NO SE CIRCUNSCRIBA A UNA ZONA ANAT\u00D3MICA, NO SE INCLUYE DOLOR FACIAL.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0112", TEXT_BOTON : "\u00BFOJO ROJO?", INFORMACION_PREGUNTA : "CUALQUIER ENROJECIMIENTO EN EL OJO. UN OJO ROJO PUEDE SER DOLOROSO O NO Y PUEDE SER COMPLETO O PARCIAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0113", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0114", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0115", TEXT_BOTON : "\u00BFSIBILANCIAS?", INFORMACION_PREGUNTA : "SIBILANCIAS AUDIBLES O A LA AUSCULTACI\u00D3N.  UNA OBSTRUCCI\u00D3N IMPORANTE DE LA V\u00CDA A\u00C9REA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0116", TEXT_BOTON : "\u00BFSIBILANCIAS?", INFORMACION_PREGUNTA : "SIBILANCIAS AUDIBLES O A LA AUSCULTACI\u00D3N.  UNA OBSTRUCCI\u00D3N IMPORANTE DE LA V\u00CDA A\u00C9REA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0117", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0118", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0119", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0120", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0121", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0122", TEXT_BOTON : "\u00BFTRAUMATISMO ESCROTAL?", INFORMACION_PREGUNTA : "TRAUMATISMO RECIENTE EN EL QUE EST\u00C9 IMPLICADO EL ESCROTO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0123", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0124", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0126", TEXT_BOTON : "NINGUNA DE LAS ANTERIORES", INFORMACION_PREGUNTA : "NINGUNA DE LAS CAUSAS ANTERIORES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0127", TEXT_BOTON : "\u00BFSECRECI\u00D3N?", INFORMACION_PREGUNTA : "EN EL CONTEXTO DE INFECCIONES DE TRANSMISI\u00D3N SEXUAL SE CORRESPONDE CON CUALQUIER SECRECI\u00D3N POR EL PENE O SECRECI\u00D3N AN\u00D3MALA POR VAGINA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0128", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0129", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0130", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0131", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0132", TEXT_BOTON : "\u00BFINFECCI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFECCI\u00D3N LOCAL QUE USUALMENTE SE MANIFIESTA COMO UNA INFLACI\u00D3N (DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO) LIMITADA A UNA PARTE O \u00C1REA ESPEC\u00CDFICA, CON O SIN COLECCI\u00D3N DE PUS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0133", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0134", TEXT_BOTON : "\u00BFINFECCI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFECCI\u00D3N LOCAL QUE USUALMENTE SE MANIFIESTA COMO UNA INFLACI\u00D3N (DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO) LIMITADA A UNA PARTE O \u00C1REA ESPEC\u00CDFICA, CON O SIN COLECCI\u00D3N DE PUS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0135", TEXT_BOTON : "\u00BFINFECCI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFECCI\u00D3N LOCAL QUE USUALMENTE SE MANIFIESTA COMO UNA INFLACI\u00D3N (DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO) LIMITADA A UNA PARTE O \u00C1REA ESPEC\u00CDFICA, CON O SIN COLECCI\u00D3N DE PUS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0136", TEXT_BOTON : "\u00BFDEFORMIDAD?", INFORMACION_PREGUNTA : "SIEMPRE ES SUBJETIVO; ANGULACI\u00D3N O ROTACI\u00D3N ANORMAL VISIBLE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0137", TEXT_BOTON : "\u00BFCOMPORTAMIENTO INFANTIL AT\u00CDPICO?", INFORMACION_PREGUNTA : "NI\u00D1O QUE SE COMPORTA DE FORMA DIFERENTE A LA NORMAL. PADRES O CUIDADORES APORTAN ESTA INFORMACI\u00D3N ESPONT\u00C1NEAMENTE. ESTOS NI\u00D1OS A MENUDO SON ETIQUETADOS COMO REBELDES O IRRITABLES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0138", TEXT_BOTON : "\u00BFCOMPORTAMIENTO INFANTIL AT\u00CDPICO?", INFORMACION_PREGUNTA : "NI\u00D1O QUE SE COMPORTA DE FORMA DIFERENTE A LA NORMAL. PADRES O CUIDADORES APORTAN ESTA INFORMACI\u00D3N ESPONT\u00C1NEAMENTE. ESTOS NI\u00D1OS A MENUDO SON ETIQUETADOS COMO REBELDES O IRRITABLES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0139", TEXT_BOTON : "\u00BFCOMPORTAMIENTO INFANTIL AT\u00CDPICO?", INFORMACION_PREGUNTA : "NI\u00D1O QUE SE COMPORTA DE FORMA DIFERENTE A LA NORMAL. PADRES O CUIDADORES APORTAN ESTA INFORMACI\u00D3N ESPONT\u00C1NEAMENTE. ESTOS NI\u00D1OS A MENUDO SON ETIQUETADOS COMO REBELDES O IRRITABLES", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0140", TEXT_BOTON : "NINGUNA DE LAS ANTERIORES", INFORMACION_PREGUNTA : "NINGUNA DE LAS CAUSAS ANTERIORES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0141", TEXT_BOTON : "\u00BFDEFORMIDAD?", INFORMACION_PREGUNTA : "SIEMPRE ES SUBJETIVO; ANGULACI\u00D3N O ROTACI\u00D3N ANORMAL VISIBLE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0142", TEXT_BOTON : "\u00BFHEMATOMA AURICULAR?", INFORMACION_PREGUNTA : "HEMATOMA A TENSI\u00D3N (NORMALMENTE DESPU\u00C9S DE UN TRAUMATISMO) EN EL PABELL\u00D3N AURICULAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0143", TEXT_BOTON : "\u00BFEDEMA FACIAL?", INFORMACION_PREGUNTA : "HINCHAZ\u00D3N DIFUSA QUE AFECTA A LA CARA. NORMALMENTE INCLUYENDO LOS LABIOS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0144", TEXT_BOTON : "\u00BFTUMEFACCI\u00D3N FACIAL?", INFORMACION_PREGUNTA : "TUMEFACCI\u00D3N QUE AFECTA A LA CARA Y QUE PUEDE SER LOCALIZADO O DIFUSA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0145", TEXT_BOTON : "\u00BFOJO ROJO?", INFORMACION_PREGUNTA : "CUALQUIER ENROJECIMIENTO EN EL OJO. UN OJO ROJO PUEDE SER DOLOROSO O NO Y PUEDE SER COMPLETO O PARCIAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0146", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0147", TEXT_BOTON : "\u00BFINFECCI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFECCI\u00D3N LOCAL QUE USUALMENTE SE MANIFIESTA COMO UNA INFLACI\u00D3N (DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO) LIMITADA A UNA PARTE O \u00C1REA ESPEC\u00CDFICA, CON O SIN COLECCI\u00D3N DE PUS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0148", TEXT_BOTON : "NINGUNA DE LOS ANTERIORES", INFORMACION_PREGUNTA : "NINGUNA DE LAS CAUSAS ANTERIORES.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0149", TEXT_BOTON : "\u00BFHEMATOMA EN CUERO CABELLUDO?", INFORMACION_PREGUNTA : "\u00C1REA CONTUSIONADA Y SOBREELEVADA EN EL CUERO CABELLUDO. LAS CONTUSIONES SITUADAS BAJO LA LINEA DEL CABELLO A NIVEL FRONTAL  SE CONSIDERAN COMO PERTENECIENTES A LA CARA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0150", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0151", TEXT_BOTON : "\u00BFINFLAMACI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFLAMACI\u00D3N LOCAL QUE IMPLICAR\u00C1 DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO, LIMITADA A UNA PARTE O \u00C1REA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0152", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7 D\u00CDAS DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0153", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0154", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0201", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0202", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0203", TEXT_BOTON : "\u00BFTUMEFACCI\u00D3N?", INFORMACION_PREGUNTA : "AUMENTO ANORMAL DE TAMA\u00D1O.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0204", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0206", TEXT_BOTON : "\u00BFTOS PRODUCTIVA?", INFORMACION_PREGUNTA : "TOS QUE PRODUCE FLEMAS, INDEPENDIENTEMENTE DEL COLOR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0207", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0208", TEXT_BOTON : "\u00BFDEFORMIDAD?", INFORMACION_PREGUNTA : "SIEMPRE ES SUBJETIVO; ANGULACI\u00D3N O ROTACI\u00D3N ANORMAL VISIBLE.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0209", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0211", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0212", TEXT_BOTON : "\u00BFINFECCI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFECCI\u00D3N LOCAL QUE USUALMENTE SE MANIFIESTA COMO UNA INFLACI\u00D3N (DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO) LIMITADA A UNA PARTE O \u00C1REA ESPEC\u00CDFICA, CON O SIN COLECCI\u00D3N DE PUS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0213", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0214", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0215", TEXT_BOTON : "\u00BFTOS PRODUCTIVA?", INFORMACION_PREGUNTA : "TOS QUE PRODUCE FLEMAS, INDEPENDIENTEMENTE DEL COLOR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0216", TEXT_BOTON : "\u00BFTOS PRODUCTIVA?", INFORMACION_PREGUNTA : "TOS QUE PRODUCE FLEMAS, INDEPENDIENTEMENTE DEL COLOR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0217", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1 - 4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0218", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1 - 4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0219", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0220", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0221", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1 - 4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0222", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0223", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0224", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0227", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0228", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0229", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0230", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0231", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0232", TEXT_BOTON : "\u00BFINFLAMACI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFLAMACI\u00D3N LOCAL QUE IMPLICAR\u00C1 DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO, LIMITADA A UNA PARTE O \u00C1REA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0233", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0234", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0235", TEXT_BOTON : "\u00BFINFLAMACI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFLAMACI\u00D3N LOCAL QUE IMPLICAR\u00C1 DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO, LIMITADA A UNA PARTE O \u00C1REA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0236", TEXT_BOTON : "\u00BFTUMEFACCI\u00D3N?", INFORMACION_PREGUNTA : "AUMENTO ANORMAL DE TAMA\u00D1O.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0237", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0238", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0239", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0241", TEXT_BOTON : "\u00BFTUMEFACCI\u00D3N?", INFORMACION_PREGUNTA : "AUMENTO ANORMAL DE TAMA\u00D1O.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0242", TEXT_BOTON : "\u00BFV\u00C9RTIGO?", INFORMACION_PREGUNTA : "SENSACI\u00D3N AGUDA DE GIRO DE OBJETOS O DE MAREO, POSIBLEMENTE ACOMPA\u00D1ADO DE NAUSEAS Y V\u00D3MITO.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0243", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0244", TEXT_BOTON : "\u00BFHEMATOMA AURICULAR?", INFORMACION_PREGUNTA : "HEMATOMA A TENSI\u00D3N (NORMALMENTE DESPU\u00C9S DE UN TRAUMATISMO) EN EL PABELL\u00D3N AURICULAR.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0245", TEXT_BOTON : "\u00BFSENSACI\u00D3N DE CUERPO EXTRA\u00D1O?", INFORMACION_PREGUNTA : "SENSACI\u00D3N DE TENER ALGO EN EL OJO, A MENUDO POR SENSACI\u00D3N DE ARENILLA O ALGO QUE RASPA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0246", TEXT_BOTON : "\u00BFDISURIA?", INFORMACION_PREGUNTA : "DOLOR O DIFICULTAD AL ORINAR. EL DOLOR NORMALMENTE ES DESCRITO COMO ESCOZOR O SENSACI\u00D3N DE QUEMAZ\u00D3N.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0247", TEXT_BOTON : "\u00BFINFLAMACI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFLAMACI\u00D3N LOCAL QUE IMPLICAR\u00C1 DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO, LIMITADA A UNA PARTE O \u00C1REA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0249", TEXT_BOTON : "\u00BFV\u00D3MITOS?", INFORMACION_PREGUNTA : "CUALQUIER EMESIS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0251", TEXT_BOTON : "\u00BFPICOR O DOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "PICOR MODERADO RECIENTE, ES CUALQUIER PRITIRO DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0253", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0254", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0301", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0302", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0303", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0306", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0307", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0308", TEXT_BOTON : "\u00BFTUMEFACCI\u00D3N?", INFORMACION_PREGUNTA : "AUMENTO ANORMAL DE TAMA\u00D1O.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0309", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1 - 4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0311", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1 - 4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0312", TEXT_BOTON : "\u00BFINFLAMACI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFLAMACI\u00D3N LOCAL QUE IMPLICAR\u00C1 DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO, LIMITADA A UNA PARTE O \u00C1REA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0313", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0314", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1 - 4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0315", TEXT_BOTON : "\u00BFLESI\u00D3N TOR\u00C1CICA?", INFORMACION_PREGUNTA : "CUALQUIER LESI\u00D3N EN EL \u00C1REA POR DEBAJO DE LAS CLAV\u00CDCULAS Y POR ENCIMA DE LA \u00DALTIMA COSTILLA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0316", TEXT_BOTON : "\u00BFLESI\u00D3N TOR\u00C1CICA?", INFORMACION_PREGUNTA : "CUALQUIER LESI\u00D3N EN EL \u00C1REA POR DEBAJO DE LAS CLAV\u00CDCULAS Y POR ENCIMA DE LA \u00DALTIMA COSTILLA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0317", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0318", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0321", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0322", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0323", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0327", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0328", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0330", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0332", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0333", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0334", TEXT_BOTON : "\u00BFINFLAMACI\u00D3N LOCAL?", INFORMACION_PREGUNTA : "INFLAMACI\u00D3N LOCAL QUE IMPLICAR\u00C1 DOLOR, TUMEFACCI\u00D3N Y ENROJECIMIENTO, LIMITADA A UNA PARTE O \u00C1REA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0335", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0336", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0337", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0338", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0339", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0341", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0342", TEXT_BOTON : "\u00BFP\u00C9RDIDA AUDITIVA RECIENTE?", INFORMACION_PREGUNTA : "P\u00C9RDIDA AUDITIVA EN UNO O AMBOS O\u00CDDOS EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0343", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0344", TEXT_BOTON : "\u00BFDIPLOPIA?", INFORMACION_PREGUNTA : "VISI\u00D3N DOBLE QUE SE RESUELVE TAPANDO UN OJO", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0345", TEXT_BOTON : "\u00BFDIPLOP\u00CDA?", INFORMACION_PREGUNTA : "VISI\u00D3N DOBLE QUE SE RESUELVE TAPANDO UN OJO", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0346", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0347", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0349", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0353", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0403", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0407", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0408", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0409", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0411", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0412", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1 - 4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0413", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0414", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0415", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0416", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0422", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0427", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0432", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0434", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0435", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0436", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0437", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0438", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0439", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0441", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0442", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0443", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0444", TEXT_BOTON : "\u00BFSENSIBILIDAD FACIAL ALTERADA?", INFORMACION_PREGUNTA : "CUALQUIER ALTERACI\u00D3N DE LA SENSIBILIDAD DE LA CARA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0445", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0446", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0447", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0449", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0512", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0536", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0542", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0544", TEXT_BOTON : "\u00BFOJO ROJO?", INFORMACION_PREGUNTA : "CUALQUIER ENROJECIMIENTO EN EL OJO. UN OJO ROJO PUEDE SER DOLOROSO O NO Y PUEDE SER COMPLETO O PARCIAL.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0545", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0642", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDV0644", TEXT_BOTON : "\u00BFFEBR\u00CDCULA (<38,5\u00B0C)?", INFORMACION_PREGUNTA : "SI LA PIEL ESTA ALGO CALIENTE AL TACTO, SE CONSIDERA FEBR\u00CDCULA. TEMPERATURA ENTRE 35,7 Y 38,5\u00B0C.", TIPO_PREGUNTA : "10"},
                       {PREGUNTA : "IDV0744", TEXT_BOTON : "\u00BFDOLOR MODERADO RECIENTE (EVA 1-4)?", INFORMACION_PREGUNTA : "CUALQUIER DOLOR DE MODERADA INTENSIDAD QUE HA COMENZADO EN LOS \u00DALTIMOS 7 D\u00CDAS. EVA 1 - 4.", TIPO_PREGUNTA : "7"},
                       {PREGUNTA : "IDV0844", TEXT_BOTON : "\u00BFPROBLEMA RECIENTE?", INFORMACION_PREGUNTA : "PROBLEMA QUE HA APARECIDO EN LA \u00DALTIMA SEMANA.", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0101", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0102", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0103", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0104", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0105", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0106", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0107", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0108", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0109", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0110", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0111", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0112", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0113", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0114", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0115", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0116", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0117", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0118", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0119", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0120", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0121", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0122", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0123", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0124", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0125", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0126", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0127", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0128", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0129", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0130", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0131", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0132", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0133", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0134", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0135", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0136", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0137", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0138", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0139", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0140", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0141", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0142", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0143", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0144", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0145", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0146", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0147", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0148", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0149", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0150", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0151", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0152", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0153", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"},
                       {PREGUNTA : "IDZ0154", TEXT_BOTON : "PROBLEMA O LESI\u00D3N NO RECIENTE", INFORMACION_PREGUNTA : "PROBLEMA CON M\u00C1S DE 7D DE EVOLUCI\u00D3N", TIPO_PREGUNTA : "0"}]);
		
					console.log("onsuccess");
					
					//SAP_UI.createDetailPage_SINTOMAS(colorsTreachByOrder);
		
					SAP_UI.createDetailPage_PACIENTES("oPacientePage","registarPaciente")
					
				};
				
				request.onerror = function(oEvent){
					//Object stores already exist (or) have now been created. store reference to DB
		
					console.log("onerror");
		
				};
						
		}




    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf ui5_offline.ui5_offline
     */
    //	onBeforeRendering: function() {
    //
    //	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf ui5_offline.ui5_offline
     */
    //	onAfterRendering: function() {
    //
    //	}

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf ui5_offline.ui5_offline
     */
    //	onExit: function() {
    //
    //	}

});