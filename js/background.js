

chrome.runtime.onMessage.addListener(function(data, sender, sendResponse){
	
	if(data.INTERFACE === 'addTitleAndWebsite'){
		addTitleAndWebsite(data,sender,sendResponse);
	}

	else if(data.sender==='5iads'){
		window.sender = sender;
		process5iads(data, sender, sendResponse);
	}else if(data.sender==='baidu'){
		processbaidu(data, sender, sendResponse);
	}
	else if(data.sender==='mbaidu'){
		processmbaidu(data, sender, sendResponse);
	}
	

	
 	return true;
});



function process5iads(data, sendResponse, sendResponse){
	var clickid = data.clickid,
		answer = data.answer || '',
		$html = $(data.html);

	// 真实ID 2+(1,2,4,6,8)-1位
	var realId = clickid.charAt(2)+clickid.charAt(3)+clickid.charAt(5)+clickid.charAt(7)+clickid.charAt(9);
	// 提取URL
	var url = $html.find('#workUrl').val();

	//提取关键字
	var keyword = '';
	try{
	var text = $html.filter(function(){
		if($(this).is('.yaoqiu')){
			return true;
		}else{
			return false;
		}}).text();
	text = text.replace(/\s/g,'#');
	text = text.replace(/((百度一下)|(输入关键词)|(搜索关键词)|(搜索)|(搜素)|(搜索#)|(输入))(:|：|\s|#)/g,'searchBegin');
	text = text.match(/(searchBegin)[\u4e00-\u9fa5a-zA-Z0-9“”"]+/)[0];
	keyword = text.replace(/searchBegin/g,"");
	// text = text.replace(/(搜索关键词：)|(搜索：)/,'domysearch');
	// text = text.replace(/\s/g,'<br>');
	// text = text.match(/(domysearch)(?:(?!<br>).|\n)*?(<br>)/)[0];
	// keyword = text.replace(/domysearch/g,"").replace(/<br>/g,"");
	}catch(e){

	}
	
	

	window.data = {
		clickid:clickid,
		url:url,
		keyword:keyword,
		realId:realId,
		answer:answer
	}

	// var searchUrl = getSearchUrl(url,keyword,website)

	$.ajax({
		url:'http://localhost:3000/task/addTaskInfo',
		method:'get',
		data:{
			taskid:clickid,
			realId:realId,
			url:url,
			keyword:keyword,
			answer:answer ? answer : undefined
		},
		success:function(data){

		}
	})



	// if(!answer){
	 	$.ajax({
			url:'http://localhost:3000/task/getTaskInfo',
			method:'get',
			data:{
				realId:realId,
				keyword:keyword
			},
			success:function(data){
				data = JSON.parse(data)[0]
				window.data.answer = data.answer;
				window.data.website = data.website;
				window.data.title = data.title;
				// window.data.searchUrl = data.searchUrl;
				var res = {
					answer:data.answer
				};


				sendResponse(res);
				
			}
		})
	// }else{
	// 	var res = {
	// 		answer:answer
	// 	};
	// 	console.log(res);
	// 	sendResponse(res);
	// }

}

function processbaidu(data, sender, sendResponse){
	sendResponse(window.data.title);
	if(window.data.title && window.data.website && window.data.answer){
		setTimeout(function(){
			chrome.tabs.remove(sender.tab.id);
		},20000);
	}
}

function processmbaidu(data, sender, sendResponse){
	console.log('to:mbaidu,title:'+data.title)
	sendResponse(window.data.title)	
	if(window.data.title && window.data.website && window.data.answer){
		setTimeout(function(){
			chrome.tabs.remove(sender.tab.id);
		},20000);
	}
}

function addTitleAndWebsite(data,sender,sendResponse){

	window.data.title = data.title;
	window.data.website = data.website;

	var data = {
			taskid:window.data.clickid,
			realId:window.data.realId,
			url:window.data.url,
			keyword:window.data.keyword,
			answer:window.data.answer,
			title:window.data.title,
			website:window.data.website,
			searchUrl:getSearchUrl(window.data.url,window.data.keyword,window.data.website)
		}
	console.log(data);

	$.ajax({
		url:'http://localhost:3000/task/addTaskInfo',
		method:'get',
		data:data,
		success:function(data){

		}
	})
}




function getSearchUrl(url,keyword,website){
	// 如果是百度
	if(url.indexOf('www.baidu.com')!==-1){
		var str = 'https://www.baidu.com/s?ie=UTF-8&wd='+keyword;
		if(website!==undefined){
			str += (' site%3A'+website);
		}
		return str;
	}else if(url.indexOf('m.baidu.com')!==-1){	//如果是手机百度
		var str = 'https://m.baidu.com/s?word='+keyword;
		if(website!==undefined){
			str += ('+site%3A'+website);
		}
		console.log(str);
		return str;
	}
}



chrome.commands.onCommand.addListener(function(cmd){
	console.log(cmd)
	if(cmd === 'begin'){
		window.popup.begin();
	}
})



