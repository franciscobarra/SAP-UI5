/*** POST WITH FORM***/

 var mapForm = document.createElement("form");
    mapForm.target = "formExcel"; 
    mapForm.method = "POST";
    mapForm.action = "http://$Server/Illuminator?";

    var keyParams = [];
    
    keyParams.push({name: "QueryTemplate", value : "$URLSQL"})
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
