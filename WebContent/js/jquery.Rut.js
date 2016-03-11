// Valida un rut
function isEmpty(s) {
	return ( (s==null) || (s.length == 0) )
}

function formatoRut(objrut)
{
  console.log("entroooo al rut");
	
  //var texto = objrut.value;
  var texto = objrut;
  var tmpstr = "";  

  if (isEmpty(texto)){
	return true;
  }

  for ( i=0; i < texto.length ; i++ )
	if ( texto.charAt(i) != ' ' && texto.charAt(i) != '.' && texto.charAt(i) != '-' )
		tmpstr = tmpstr + texto.charAt(i);
  

  texto = tmpstr;
  largo = texto.length;


  if ( largo < 2 )
	{
    	return false;
	}


  for (i=0; i < largo ; i++ )
	{ 
    	if ( texto.charAt(i) !="0" && texto.charAt(i) != "1" && texto.charAt(i) !="2" && texto.charAt(i) != "3" && texto.charAt(i) != "4" && texto.charAt(i) !="5" && texto.charAt(i) != "6" && texto.charAt(i) != "7" && texto.charAt(i) !="8" && texto.charAt(i) != "9" && texto.charAt(i) !="k" && texto.charAt(i) != "K" ) 
		{
			return false;
		}
	}
	  var invertido = "";
  for ( i=(largo-1),j=0; i>=0; i--,j++ )
  	invertido = invertido + texto.charAt(i);
	
  var dtexto = "";

  dtexto = dtexto + invertido.charAt(0);
  dtexto = dtexto + '-';
  cnt = 0;

 for ( i=1,j=2; i<largo; i++,j++ )
	{
    	if ( cnt == 3 )
		{
		dtexto = dtexto + '.';
		j++;
		dtexto = dtexto + invertido.charAt(i);
		cnt = 1;
		}
    	else
		{ 
		dtexto = dtexto + invertido.charAt(i);
		cnt++;
		}
	}

  invertido = "";

  for ( i=(dtexto.length-1),j=0; i>=0; i--,j++ )
	invertido = invertido + dtexto.charAt(i);

  console.log("invertido:" + invertido);

  objrut = invertido;
  //alert (invertido)
  //if ( checkDV(texto) )
  //  	return true;
  return objrut;
}

//***********************************************************************************************************************************



//FUNCION VALIDACION RUT
function checkRutField(texto)
{
 // texto = texto + dv

  var tmpstr = "";

  for ( i=0; i < texto.length ; i++ )
    if ( texto.charAt(i) != ' ' && texto.charAt(i) != '.' && texto.charAt(i) != '-' )
      tmpstr = tmpstr + texto.charAt(i);
  texto = tmpstr;
  
  largo = texto.length;

  if ( largo < 2 )
  {
    //alert("El RUT es inválido");
    console.log("El RUT es inválido");
    document.getElementById("documento").value = "";
    //document.getElementById("documento").focus();
    //document.getElementById("documento").select();
    return false;
  }
  for (i=0; i < largo ; i++ )
  { 
	if ( texto.charAt(i) !="0" && texto.charAt(i) != "1" && texto.charAt(i) !="2" && texto.charAt(i) != "3" && texto.charAt(i) != "4" && texto.charAt(i) !="5" && texto.charAt(i) != "6" && texto.charAt(i) != "7" && texto.charAt(i) !="8" && texto.charAt(i) != "9" && texto.charAt(i) !="k" && texto.charAt(i) != "K" ) 
    {
		alert("El RUT es correcto");
		console.log("El RUT es correcto");
		document.getElementById("documento").value = "";
		document.getElementById("documento").focus();
		document.getElementById("documento").select();
	    return false;
    }
  }
  var invertido = "";

  for ( i=(largo-1),j=0; i>=0; i--,j++ )
    invertido = invertido + texto.charAt(i);
  var dtexto = "";

  dtexto = dtexto + invertido.charAt(0);
  dtexto = dtexto + '-';
  cnt = 0;
  for ( i=1,j=2; i<largo; i++,j++ )
  {
    if ( cnt == 3 )
    {
      dtexto = dtexto + '.';
      j++;
	  dtexto = dtexto + invertido.charAt(i);
      cnt = 1;
    }
    else
    { 
      dtexto = dtexto + invertido.charAt(i);
      cnt++;
    }
  }
  invertido = "";
  


  for ( i=(dtexto.length-1),j=0; i>=2; i--,j++ )
	if (dtexto.charAt(i) == "k")
		invertido = invertido + "K";		
	else{
		invertido = invertido + dtexto.charAt(i);
		document.getElementById("documento").value = invertido;  
	}
	
  if ( checkDV(texto) )
    return true;
  
  return false;
}

//FUNCION VALIDACION DIGITO VERIFICADOR
function checkDV( crut )
{
  largo = crut.length;
  if ( largo < 2 )
  {

    alert("El RUT ingresado no es valido por favor verifique e ingrese nuevamentee")
    document.getElementById("documento").focus();
    document.getElementById("documento").select();
    return false;
  }
  if ( largo > 2 )
	rut = crut.substring(0, largo - 1);
  else
    rut = crut.charAt(0);
  dv = crut.charAt(largo-1);
  //checkCDV( dv );
  if ( rut == null || dv == null )
      return 0
  var dvr = '0'
  suma = 0
  mul  = 2
  for (i= rut.length -1 ; i >= 0; i--)
  {
    suma = suma + rut.charAt(i) * mul
    if (mul == 7)
      mul = 2
    else    
      mul++
  }
  res = suma % 11
  if (res==1)
    dvr = 'K'
  else if (res==0)
    dvr = '0'
  else
  {
    dvi = 11-res
    dvr = dvi + ""
  }
  //window.document.ident.digito.value=dv.toUpperCase()	
  document.getElementById("documento").value = document.getElementById("documento").value + '-' + dv.toUpperCase();
  if ( dvr != dv.toUpperCase() )
  {
    alert("El RUT ingresado no es Válido")
    document.getElementById("documento").value = "";
    document.getElementById("documento").focus();
    return false
  }
  return true
}