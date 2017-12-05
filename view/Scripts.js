		var token='Y7yTYSaKsWrlpdhwY08gMqRiyV6798oTMzF5W0TDRsvcedNgLDI'
		var base_url = 'http://localhost:3000/';
		//http://localhost:3000/
		//https://csc309-cookingmama.herokuapp.com/
		var messages=[]
		function refresh_messages(){
			if($("#messages").length){
				$.ajax({
					type: 'GET',
					url: base_url+'api/messages',
					success: function(data){
						$.each(data,function(i,item){
							if (messages.indexOf(item.id) < 0){
								$("#messages").prepend($('<p style="background-color:rgba(255,255,0,0.3)">').text(item.text))
								messages.push(item.id)
								$('html, body').animate({ scrollTop: 0 }, 'fast');
							}
						})
					},
					error: error_handler
				});
			}
		}

		function print_champ(data){
			$('#champion_list').text("");
			$.each(data,function(i,item){
				var champ_detail = "<table style='width:450px'><tr><td>HP: "+item.hp+"</td><td>+"+item.hpperlevel+"/lv</td><td>HP regenaration: "+item.hpregen+"/s</td><td>+"+item.hpregenperlevel+"/lv</td></tr><tr><td>MP: "+item.mp+"</td><td>+"+item.mpperlevel+"/lv</td><td>MP regenaration: "+item.mpregen+"/s</td><td>+"+item.mpregenperlevel+"/lv</td></tr><tr><td>Armor: "+item.armor+"</td><td>+"+item.armorperlevel+"/lv</td><td>Magic Resist: "+item.spellblock+"</td><td>+"+item.spellblockperlevel+"/lv</td></tr><tr><td>Attack Damage: "+item.attackdamage+"</td><td>+"+item.attackdamageperlevel+"/lv</td><td>Critical Chance: "+item.crit+"</td><td>+"+item.critperlevel+"/lv</td></tr><tr><td>Attack Range: "+item.attackrange+"</td><td></td><td>Attack Speed: "+(0.625/(1+item.attackspeedoffset)).toFixed(2)+"</td><td>+"+item.attackspeedperlevel+"%/lv</td></tr><tr><td>Movement Speed: "+item.movespeed+"</td></tr>";
				var temp = $('<div>').attr('data-toggle',"popover")
									.attr('data-content',champ_detail)
									.attr('title',item.name)
									.append($('<img>').attr('src', item.image_url))
									.append($('<p>').text(item.name))
									.append($('<button>').attr('class', 'btn btn-sm btn-danger glyphicon glyphicon-heart-empty add_like')
														.attr('champ_name', item.name))
									.append($('<button>').attr('class', 'btn btn-default btn-sm compare_champ')
														.attr('champ_id', item.id)
														.text("+Compare"))
									.append($('<button>').attr('class', 'btn btn-default btn-sm remove_compare_champ')
														.attr('champ_id', item.id)
														.text("Remove"))
									
				$("<li>").append(temp).appendTo('#champion_list')
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
				$.ajax({
					type: 'GET',
					url: base_url+'api/champions',
					success: [print_champ, function(){messages = [];refresh_messages();}],
					error: error_handler
				});
			});
		});

		$(document).on('click', '#search_champ',function(){
			$.ajax({
				type: 'GET',
				url: base_url+'api/search_champions?name='+$('#search_champ_input').val(),
				success: print_champ,
				error: error_handler
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
					for (var i=0; i < compare_champ.length - 1; i++){
						IDs += compare_champ[i] + ',';
					}
					IDs += compare_champ[compare_champ.length-1];
					$.ajax({
						type: 'GET',
						url: base_url+'api/compare_champ?IDs='+IDs,
						success: function(data){
							$.each(data,function(i,item){
								$('#champ_'+i+'_image').attr('src', item.big_image_url);
								$('#compare_name').append($('<td>').text(item.name))
												.append($('<td>'));
								$('#compare_hp').append($('<td>').text(parseFloat(item.hp).toFixed(2)))
												.append($('<td>').text((parseFloat(item.hp) + parseFloat(item.hpperlevel)*17).toFixed(2)));
								$('#compare_hpregen').append($('<td>').text(parseFloat(item.hpregen).toFixed(2)))
												.append($('<td>').text((parseFloat(item.hpregen) + parseFloat(item.hpregenperlevel)*17).toFixed(2)));
								$('#compare_mp').append($('<td>').text(parseFloat(item.mp).toFixed(2)))
												.append($('<td>').text((parseFloat(item.mp) + parseFloat(item.mpperlevel)*17).toFixed(2)));
								$('#compare_mpregen').append($('<td>').text(parseFloat(item.mpregen).toFixed(2)))
												.append($('<td>').text((parseFloat(item.mpregen) + parseFloat(item.mpregenperlevel)*17).toFixed(2)));
								$('#compare_ad').append($('<td>').text(parseFloat(item.attackdamage).toFixed(2)))
												.append($('<td>').text((parseFloat(item.attackdamage) + parseFloat(item.attackdamageperlevel)*17).toFixed(2)));
								$('#compare_arange').append($('<td>').text(parseFloat(item.attackrange).toFixed(2)))
												.append($('<td>'));
								var attackspeed = (0.625/(1+parseFloat(item.attackspeedoffset))).toFixed(2);
								$('#compare_aspeed').append($('<td>').text(attackspeed))
												.append($('<td>').text((attackspeed * (1 + parseFloat(item.attackspeedperlevel)*0.17)).toFixed(2)));
								$('#compare_armor').append($('<td>').text(parseFloat(item.armor).toFixed(2)))
												.append($('<td>').text((parseFloat(item.armor) + parseFloat(item.armorperlevel)*17).toFixed(2)));
								$('#compare_mr').append($('<td>').text(parseFloat(item.spellblock).toFixed(2)))
												.append($('<td>').text((parseFloat(item.spellblock) + parseFloat(item.spellblockperlevel)*17).toFixed(2)));
								$('#compare_movespeed').append($('<td>').text(parseFloat(item.movespeed).toFixed(2)))
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
				if (item.current_team_url != null){
					team_img_url = item.current_team_url;
				}else{
					team_img_url = "/static/null_team.png";
				}
				if (item.current_team_name != null){
					team_name = item.current_team_name;
				}else{
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
				$.ajax({
					type: 'GET',
					url: base_url+'api/player_page?role=&name=',
					success: [function(data){
						$('#player_pager').twbsPagination({
							totalPages: data[0].ceil,
							visiblePages: 10,
							onPageClick: function (event, page) {
								$.ajax({
									type: 'GET',
									url: base_url+'api/players?role=&name=&page='+page,
									success: print_players,
									error: error_handler
								});
							}
						});
					}, function(){messages = [];refresh_messages();}],
					error: error_handler
				})
			});
		});

		$(document).on('click', '#search_player',function(){
			$.ajax({
				type: 'GET',
				url: base_url+'api/player_page?role=&name='+$('#search_player_input').val(),
				success: function(data){
					$('#player_pager').twbsPagination('destroy');
					$('#player_pager').twbsPagination({
						totalPages: data[0].ceil,
						visiblePages: 10,
						onPageClick: function (event, page) {
							$.ajax({
								type: 'GET',
								url: base_url+'api/players?role=&name='+$('#search_player_input').val()+'&page='+page,
								success: print_players,
								error: error_handler
							});
						}
					});
				},
				error: error_handler
			})
		});

		$(document).on('click', '.role_filter',function(){
			var cur_role = $(this).attr('id');
			$.ajax({
				type: 'GET',
				url: base_url+'api/player_page?role='+cur_role+'&name='+$('#search_player_input').val(),
				success: function(data){
					$('#player_pager').twbsPagination('destroy');
					$('#player_pager').twbsPagination({
						totalPages: data[0].ceil,
						visiblePages: 10,
						onPageClick: function (event, page) {
							$.ajax({
								type: 'GET',
								url: base_url+'api/players?role='+cur_role+'&name='+$('#search_player_input').val()+'&page='+page,
								success: print_players,
								error: error_handler
							});
						}
					});
				},
				error: error_handler
			});
		});

		
		$(document).on('click', '#favourites',function(){
			$('body').load('/static/favourites.html #view',function(){
				$.ajax({
					type: 'GET',
					url: base_url+'api/like',
					success: function(data){
						$.each(data,function(i,item){
							var pref = $('<select class="form-control">').attr('id','liked_'+item.id.toString())
							for(var i=1; i<=5; i++){
								if (i == item.preferrencelvl){
									pref.append($('<option selected>').text(i).attr('value', i))
								}else{
									pref.append($('<option>').text(i).attr('value', i))
								}
							}
							var row=$('<tr>').append($('<td>').append($('<img>').attr('src', item.image_url)))
											.append($('<td>').text(item.name))
											.append($('<td>').append(pref))
											.append($('<td>').append($('<button class="btn btn-info modify_like">').text('Modify').attr('liked_id', item.id)))
											.append($('<td>').append($('<button class="btn btn-danger delete_like">').text('Delete').attr('liked_id', item.id)))
											.attr('id','like_row_'+item.id.toString())
							$('#liked_body').append(row)
						});
					},
					error: error_handler
				});
			});
		});
		
		$(document).on('click', '.modify_like',function(){
			var liked_id = $(this).attr('liked_id')
			var prefLvl={}
			prefLvl.preferrenceLvl=$('#liked_'+liked_id).val()
			$.ajax({
				type:'PUT',
				url:base_url+'api/like/'+liked_id,
				data: prefLvl,
				success: function(data){
					if (data.status == "success"){
						alert("The preference level for has been changed to "+prefLvl.preferrenceLvl+"!!")
					}else{
						error_handler();
					}
				},
				error: function(){alert("Failed to update");}
			});
		});
		
		$(document).on('click', '.delete_like',function(){
			var liked_id = $(this).attr('liked_id')
			$.ajax({
				type:'DELETE',
				url:base_url+'api/like/'+liked_id,
				success: function(data){
					if (data.status == "success"){
						alert("Successfully deleted!!");
						$('#like_row_'+liked_id).remove();
					}else{
						error_handler();
					}
				},
				error: function(){alert("Failed to delete");}
			});
		});
		
		$(document).on('click', '.add_like',function(){
			var post_data = {}
			post_data.champName = $(this).attr('champ_name')
			$.ajax({
				type:'POST',
				url:base_url+'api/like',
				data: post_data,
				success: function(data){
					if (data.status == "success"){
						alert(post_data.champName+" is added to favourites!!")
					}else{
						error_handler();
					}
				},
				error: function(){alert("Champion already exists in favourites");}
			});
		});
		
		var refresh = setInterval(refresh_messages, 10000);