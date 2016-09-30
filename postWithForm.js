/*** POST WITH FORM***/

 var mapForm = document.createElement("form");
    mapForm.target = "formExcel"; 
    mapForm.method = "POST";
    mapForm.action = "http://miiforqas.arauco.cl:50000/XMII/Illuminator?";

    var keyParams = [];
    
    keyParams.push({name: "QueryTemplate", value : "IPFOREST/SQLQUERYS/TransporteVentas/GUIA_DESPACHO/SQL_Combo_Filtros_GD"})
    keyParams.push({name: "Param.1", value : "1"})

    for (var i = 0; i < keyParams.length; i++){
        var mapInput = document.createElement("input");
            mapInput.type = "text";
            mapInput.name = keyParams[i].name;
            mapInput.value = keyParams[i].value;
            mapForm.appendChild(mapInput);

    }
    
    var mapInputContent = document.createElement("input");
    mapInputContent.type = "text";
    mapInputContent.name = "Content-Type";
    mapInputContent.value = "text/csv";
    mapForm.appendChild(mapInputContent);

    document.body.appendChild(mapForm);

    mapForm.submit();
