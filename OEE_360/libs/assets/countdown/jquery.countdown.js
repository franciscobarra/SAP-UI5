function createCount(h,m,s,renderTo){

	$.fn.countdown = function(prop){
		var options = $.extend({
			callback	: function(){},
			timestamp	: 0
		},prop);
		
		var positions;

		init(this, options);
		
		positions = this.find('.position');

		aCount.push({
			renderTo   : renderTo,
			positions  : positions,
			h  : h,
			m : m,
			s : s
		});			
		
		return this;
	}
	
	$(renderTo).countdown({
		timestamp	: new Date("00:00:00")
	});


}

function refreshCounts(){
	for(var i = 0; i< aCount.length; i++){
		switchDigit(aCount[i].positions.eq(0),Math.floor(aCount[i].h/10)%10);
		switchDigit(aCount[i].positions.eq(1),aCount[i].h%10);
		switchDigit(aCount[i].positions.eq(2),Math.floor(aCount[i].m/10)%10);
		switchDigit(aCount[i].positions.eq(3),aCount[i].m%10);
		switchDigit(aCount[i].positions.eq(4),Math.floor(aCount[i].s/10)%10);
		switchDigit(aCount[i].positions.eq(5),aCount[i].s%10);
	}

}	


function init(elem, options){
	elem.addClass('countdownHolder');

	$.each(['Hours','Minutes','Seconds'],function(i){
		$('<span class="count'+this+'">').html(
			'<span class="position">\
			<span class="digit static">0</span>\
			</span>\
			<span class="position">\
			<span class="digit static">0</span>\
			</span>'
			).appendTo(elem);

		if(this!="Seconds"){
			elem.append('<span class="countDiv countDiv'+i+'"></span>');
		}
	});

}

function switchDigit(position,number){
	var digit = position.find('.digit')

	if(digit.is(':animated')){
		return false;
	}

	if(position.data('digit') == number){
			// We are already showing this number
			return false;
		}
		
		position.data('digit', number);
		
		var replacement = $('<span>',{
			'class':'digit',
			css:{
				top:'-2.1em',
				opacity:0
			},
			html:number
		});
		
		digit
		.before(replacement)
		.removeClass('static')
		.animate({top:'2.5em',opacity:0},'fast',function(){
			digit.remove();
		})

		replacement
		.delay(100)
		.animate({top:0,opacity:1},'fast',function(){
			replacement.addClass('static');
		});

	}
