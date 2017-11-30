		var token='Y7yTYSaKsWrlpdhwY08gMqRiyV6798oTMzF5W0TDRsvcedNgLDI'
		var per_page_champ = 48;
		var per_page_player = 12;
		var old_url ='https://api.pandascore.co/';
		var base_url = 'http://localhost:3000/';

		function print_champ(data){
			$('#champion_list').text("");
			$.each(data,function(i,item){
				var champ_detail = "<table style='width:450px'><tr><td>HP: "+item.hp+"</td><td>+"+item.hpperlevel+"/lv</td><td>HP regenaration: "+item.hpregen+"/s</td><td>+"+item.hpregenperlevel+"/lv</td></tr><tr><td>MP: "+item.mp+"</td><td>+"+item.mpperlevel+"/lv</td><td>MP regenaration: "+item.mpregen+"/s</td><td>+"+item.mpregenperlevel+"/lv</td></tr><tr><td>Armor: "+item.armor+"</td><td>+"+item.armorperlevel+"/lv</td><td>Magic Resist: "+item.spellblock+"</td><td>+"+item.spellblockperlevel+"/lv</td></tr><tr><td>Attack Damage: "+item.attackdamage+"</td><td>+"+item.attackdamageperlevel+"/lv</td><td>Critical Chance: "+item.crit+"</td><td>+"+item.critperlevel+"/lv</td></tr><tr><td>Attack Range: "+item.attackrange+"</td><td></td><td>Attack Speed: "+(0.625/(1+item.attackspeedoffset)).toFixed(2)+"</td><td>+"+item.attackspeedperlevel+"%/lv</td></tr><tr><td>Movement Speed: "+item.movespeed+"</td></tr>";
				var temp = $('<div>').attr('data-toggle',"popover")
									.attr('data-content',champ_detail)
									.attr('title',item.name)
									.append($('<img>').attr('src', item.image_url))
									.append($('<p>').text(item.name))
									.append($('<button>').attr('class', 'btn btn-sm btn-danger glyphicon glyphicon-heart-empty')
														.attr('champ_id', item.id))
									.append($('<button>').attr('class', 'btn btn-default btn-sm compare_champ')
														.attr('champ_id', item.id)
														.text("+Compare"))
									.append($('<button>').attr('class', 'btn btn-default btn-sm remove_compare_champ')
														.attr('champ_id', item.id)
														.text("Remove"))
									
				$('<li>').append(temp).appendTo('#champion_list')
			});
			$('[data-toggle="popover"]').popover({
				html:'true',
				placement:'bottom',
				trigger:'hover'
			});
		}

		function error_handler(xhr, error) {
			alert("Oops!! Something went wrong: ", error)
		}
		
		
		$(document).on('click', '#login',function(){
			var params = {};
			params.username = $("#username").val();
			params.password = $("#password").val();
			if (params.username == '' || params.password == ''){
				alert("Username and password cannot be empty!!")
			}else{
				$.ajax({
					type:'POST',
					url:base_url+'api/validation',
					data: params,
					success: function(data){
						if (data.status == "success"){
							$('#champions').trigger('click');
						}else{
							alert("invalid username or password");
						}
					},
					error: error_handler
				});
			}
		});
		
		$(document).on('click', '#register',function(){
			var params = {};
			params.username = $("#username").val();
			params.password = $("#password").val();
			if (params.username == '' || params.password == ''){
				alert("Username and password cannot be empty!!")
			}else{
				$.ajax({
					type:'POST',
					url:base_url+'api/register',
					data: params,
					success: function(data){
						if (data.status == "success"){
							alert("You have registered. You can log in now!!")
						}else{
							error_handler();
						}
					},
					error: function(){alert("Failed to add user: username exist");}
				});
			}
		});
	

		$(document).on('click', '#champions',function(){
			$('body').load('/static/champions.html #view',function(){
				$('#champ_pager').twbsPagination({
					totalPages: 3,
					visiblePages: 3,
					onPageClick: function (event, page) {
						$.ajax({
							type: 'GET',
							url: old_url+'lol/champions?search[name]='+$('#search_champ_input').val()+'&per_page='+per_page_champ+'&page='+page+'&token='+token,
							success: print_champ,
							error: error_handler
						});
					}
				});
			});
		});

		$(document).on('click', '#search_champ',function(){
			$('#champ_pager').twbsPagination('destroy');
			$('#champ_pager').twbsPagination({
				totalPages: 3,
				visiblePages: 3,
				onPageClick: function (event, page) {
					$.ajax({
						type: 'GET',
						url: old_url+'lol/champions?search[name]='+$('#search_champ_input').val()+'&per_page='+per_page_champ+'&page='+page+'&token='+token,
						success: print_champ,
						error: error_handler
					});
				}
			});
		});

		var compare_champ=[]
		$(document).on('click', '.compare_champ',function(){
			if(compare_champ.indexOf($(this).attr('champ_id')) > -1){
				alert("This champion is already in the compare list");
			}else if(compare_champ.length >= 4){
				alert("Sorry, you can only add four champions to compare!");
			}else{
				compare_champ.push($(this).attr('champ_id'));
				alert("Champion add successfully");
			}
		});

		$(document).on('click', '.remove_compare_champ',function(){
			var index = compare_champ.indexOf($(this).attr('champ_id'))
			if(index > -1){
				compare_champ.splice(index, 1);
				alert("Champion removed successfully");
			}else{
				alert("Champion is not in the compare list");
			}
		});
		
		$(document).on('click', '#compare_champ',function(){
			if (compare_champ.length == 0){
				alert("You haven't add any champion to compare yet!")
			}else{
				$('body').load('/static/compare_champ.html #view',function(){
					var IDs = "";
					for (var i=0; i < compare_champ.length; i++){
						IDs += compare_champ[i] + ',';
					}
					$.ajax({
						type: 'GET',
						url: old_url+'lol/champions?filter[id]='+IDs+'&token='+token,
						success: function(data){
							$.each(data,function(i,item){
								$('#champ_'+i+'_image').attr('src', item.big_image_url);
								$('#compare_name').append($('<td>').text(item.name))
												.append($('<td>'));
								$('#compare_hp').append($('<td>').text(item.hp.toFixed(2)))
												.append($('<td>').text((item.hp + item.hpperlevel*17).toFixed(2)));
								$('#compare_hpregen').append($('<td>').text(item.hpregen.toFixed(2)))
												.append($('<td>').text((item.hpregen + item.hpregenperlevel*17).toFixed(2)));
								$('#compare_mp').append($('<td>').text(item.mp.toFixed(2)))
												.append($('<td>').text((item.mp + item.mpperlevel*17).toFixed(2)));
								$('#compare_mpregen').append($('<td>').text(item.mpregen.toFixed(2)))
												.append($('<td>').text((item.mpregen + item.mpregenperlevel*17).toFixed(2)));
								$('#compare_ad').append($('<td>').text(item.attackdamage.toFixed(2)))
												.append($('<td>').text((item.attackdamage + item.attackdamageperlevel*17).toFixed(2)));
								$('#compare_arange').append($('<td>').text(item.attackrange.toFixed(2)))
												.append($('<td>'));
								var attackspeed = (0.625/(1+item.attackspeedoffset)).toFixed(2);
								$('#compare_aspeed').append($('<td>').text(attackspeed))
												.append($('<td>').text((attackspeed * (1 + item.attackspeedperlevel*0.17)).toFixed(2)));
								$('#compare_armor').append($('<td>').text(item.armor.toFixed(2)))
												.append($('<td>').text((item.armor + item.armorperlevel*17).toFixed(2)));
								$('#compare_mr').append($('<td>').text(item.spellblock.toFixed(2)))
												.append($('<td>').text((item.spellblock + item.spellblockperlevel*17).toFixed(2)));
								$('#compare_movespeed').append($('<td>').text(item.movespeed.toFixed(2)))
												.append($('<td>'));
							});
						},
						error: error_handler
					});
				});
			}
		});
		
		$(document).on('click', '#clear_return',function(){
			compare_champ=[];
			$('#champions').trigger('click');
		});

		function print_players(data){
			$('#player_list').text("");
			$.each(data,function(i,item){
				var img_url,team_img_url, team_name;
				if (item.current_team != null){
					team_img_url = item.current_team.image_url;
					team_name = item.current_team.name;
				}else{
					team_img_url = "/static/null_team.png";
					team_name = "No team";
				}
				var player_detail = "<img src='"+team_img_url+"' style='width:120px;height:120px;float:left;'/>"+"Team Name: "+team_name+"<br>First Name: "+item.first_name+"<br>Last Name: "+item.last_name+"<br>Hometown: "+item.hometown+"<br>Role: "+item.role;
				if (item.image_url == null){
						img_url = "/static/null_image.png"
				}else{
						img_url = item.image_url
				}
				var temp = $('<div>').attr('data-toggle',"popover")
									.attr('data-content',player_detail)
									.attr('title',item.name)
									.append($('<img>').attr('src', img_url).attr('style',"width:313.6px;height:248.4px;"))
									.append($('<p>').text(item.name))
				$('<li>').append(temp).appendTo('#player_list')
			});
			$('[data-toggle="popover"]').popover({
				html:'true',
				placement:'bottom',
				trigger:'hover'
			});
		}

		$(document).on('click', '#players',function(){
			$('body').load('/static/player.html #view',function(){
				$('#player_pager').twbsPagination({
					totalPages: Math.floor(1622/per_page_player)+1,
					visiblePages: 10,
					onPageClick: function (event, page) {
						$.ajax({
							type: 'GET',
							url: old_url+'lol/players?search[name]='+$('#search_player_input').val()+'&per_page='+per_page_player+'&page='+ page + '&token=' + token,
							success: print_players,
							error: error_handler
						});
					}
				});
			});
		});

		$(document).on('click', '#search_player',function(){
			$('#player_pager').twbsPagination('destroy');
			$('#player_pager').twbsPagination({
				totalPages: Math.floor(1622/per_page_player)+1,
				visiblePages: 10,
				onPageClick: function (event, page) {
					$.ajax({
						type: 'GET',
						url: old_url+'lol/players?search[name]='+$('#search_player_input').val()+'&per_page='+per_page_player+'&page='+ page + '&token=' + token,
						success: print_players,
						error: error_handler
					});
				}
			});
		});

		$(document).on('click', '#top',function(){
			$('#player_pager').twbsPagination('destroy');
			$('#player_pager').twbsPagination({
				totalPages: Math.floor(234/per_page_player)+1,
				visiblePages: 10,
				onPageClick: function (event, page) {
					$.ajax({
						type: 'GET',
						url: old_url+'lol/players?search[name]='+$('#search_player_input').val()+'&filter[role]=top'+'&per_page='+per_page_player+'&page='+ page + '&token=' + token,
						success: print_players,
						error: error_handler
					});
				}
			});
		});

		$(document).on('click', '#jun',function(){
			$('#player_pager').twbsPagination('destroy');
			$('#player_pager').twbsPagination({
				totalPages: Math.floor(245/per_page_player)+1,
				visiblePages: 10,
				onPageClick: function (event, page) {
					$.ajax({
						type: 'GET',
						url: old_url+'lol/players?search[name]='+$('#search_player_input').val()+'&filter[role]=jun'+'&per_page='+per_page_player+'&page='+ page + '&token=' + token,
						success: print_players,
						error: error_handler
					});
				}
			});
		});

		$(document).on('click', '#mid',function(){
			$('#player_pager').twbsPagination('destroy');
			$('#player_pager').twbsPagination({
				totalPages: Math.floor(233/per_page_player)+1,
				visiblePages: 10,
				onPageClick: function (event, page) {
					$.ajax({
						type: 'GET',
						url: old_url+'lol/players?search[name]='+$('#search_player_input').val()+'&filter[role]=mid'+'&per_page='+per_page_player+'&page='+ page + '&token=' + token,
						success: print_players,
						error: error_handler
					});
				}
			});
		});

		$(document).on('click', '#adc',function(){
			$('#player_pager').twbsPagination('destroy');
			$('#player_pager').twbsPagination({
				totalPages: Math.floor(221/per_page_player)+1,
				visiblePages: 10,
				onPageClick: function (event, page) {
					$.ajax({
						type: 'GET',
						url: old_url+'lol/players?search[name]='+$('#search_player_input').val()+'&filter[role]=adc'+'&per_page='+per_page_player+'&page='+ page + '&token=' + token,
						success: print_players,
						error: error_handler
					});
				}
			});
		});

		$(document).on('click', '#sup',function(){
			$('#player_pager').twbsPagination('destroy');
			$('#player_pager').twbsPagination({
				totalPages: Math.floor(233/per_page_player)+1,
				visiblePages: 10,
				onPageClick: function (event, page) {
					$.ajax({
						type: 'GET',
						url: old_url+'lol/players?search[name]='+$('#search_player_input').val()+'&filter[role]=sup'+'&per_page='+per_page_player+'&page='+ page + '&token=' + token,
						success: print_players,
						error: error_handler
					});
				}
			});
		});
		
		$(document).on('click', '#favourites',function(){
			$('body').load('/static/favourites.html #view',function(){
				$('#champ_pager').twbsPagination({
					totalPages: 3,
					visiblePages: 3,
					onPageClick: function (event, page) {
						$.ajax({
							type: 'GET',
							url: old_url+'lol/champions?search[name]='+$('#search_champ_input').val()+'&per_page='+per_page_champ+'&page='+page+'&token='+token,
							success: print_champ,
							error: error_handler
						});
					}
				});
			});
		});