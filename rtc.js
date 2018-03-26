jQuery(document).ready(function($){
	var imported = document.createElement('script');
	imported.src = 'https://cdn.WebRTC-Experiment.com/RecordRTC.js';
	document.head.appendChild(imported);


	var record = false,recordRTC,gstream,videourl, rec_type, wavesurfer;
	var tmp_image, tmp_video, tmp_audio;
	var send_image, send_video, send_audio;
	var dataurl_video, dataurl_audio, canvas;

	$("body").prepend('<div id="rtc-plugin" class="plugin"></div>')
	// $("body").prepend('<div id="rtc-plugin" class="plugin" style="display: block;"></div>')
	showMenu();

	function showMenu(){
		$("#rtc-plugin").html('<div class="plugin-body"> \
				    WHAT TO RECORD? \
				    </div> \
				    <div class="glyphs"> \
					        <hr> \
					    <a id="record-audio" href="#"><i class="fas fa-microphone"></i></a> \
					    <a id="capture-image" href="#"><i class="fas fa-camera"></i></a> \
					    <a id="record-video" href="#"><i class="fas fa-video"></i></a>			    \
					        <hr> \
				    </div>')		
	}
	function showRecordUI(){
		$("#rtc-plugin").html('<div class="plugin-photo"> \
				    </div> \
				    <div class="plugin-footer"> \
				        <div class="plugin-bot text"> \
				            <a id="btn-startRecord" href="#">Start Recording</a> \
				        </div> \
				        <div class="plugin-bot rec"> \
				            <div class="rec-circle"></div> \
				            <p>REC</p> \
				        </div> \
				    </div> ');
	}
	function showPreviewUI(){
		$("#rtc-plugin").html('<div class="plugin-photo"></div><div class="plugin-footer"></div>');
	}
	function successCallback(stream) {
	    // RecordRTC usage goes here
	    console.log(stream)
	    gstream = stream
	    $("#video-capture").attr('src',URL.createObjectURL(stream))
    	var options = {
	      mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
	      audioBitsPerSecond: 228000,
	      videoBitsPerSecond: 228000,
	      bitsPerSecond: 228000 // if this line is provided, skip above two
	    };
	    recordRTC = RecordRTC(stream, options);
	    recordRTC.startRecording();
	}

	function errorCallback(error) {
		console.log("Camera Error = " + error)	    
	}

	function showSave(){
		$("#rtc-plugin").html('<div class="percent"><p>100%</p></div><div class="under-percent"><i class="fas fa-check-circle"></i><p>SAVED</p></div>');
			$("#rtc-plugin").attr('style','');
			setTimeout(function(){				
				showMenu();
			},3000);
	}
	
	function recordVideo(){
		showRecordUI();
		$("#rtc-plugin .plugin-photo").html('<video id="video-capture" width="180" height="120" autoplay></video>');
	  	$("#rtc-plugin #btn-startRecord").attr('data-recordtype','video/webm');

	  	var mediaConstraints = { video: {width: 180, height: 120}, audio: false };
		navigator.mediaDevices.getUserMedia(mediaConstraints).then(function(stream){
			gstream = stream
			$("#video-capture").attr('src',URL.createObjectURL(stream))
		}).catch(errorCallback);
	}
	function recordAudio(){
		showRecordUI(); 
		
		$("#rtc-plugin #btn-startRecord").attr('data-recordtype','audio/webm');
		var mediaConstraints = { audio: true };
		navigator.mediaDevices.getUserMedia(mediaConstraints).then(function(stream){
				gstream = stream			
			}).catch(errorCallback);
	}

	

	$('body').on('click', '#record-video', function(e) {
		recordVideo();
	});
	


	
	$('body').on('click', '#record-audio', function(e) {	  
		e.preventDefault();	 
		recordAudio();
	});

	function showStopMenu(){
		$("#rtc-plugin").html('<div class="plugin-photo"></div>');
		$("#rtc-plugin .plugin-photo").html('<div class="menu-container"> \
					<a id="save-recording">  \
				            <div class="menu-row" style="cursor: pointer;">  \
				                <i class="fas fa-cloud-upload-alt"></i> \
				                <p>SAVE RECORDING</p> \
				            </div> </a>\
				    <a id="preview-recording">  \
				            <div class="menu-row" style="cursor: pointer;"> \
				                <i class="fas fa-eye"></i> \
				                <p>PREVIEW RECORDING</p> \
				            </div> </a> \
				    <a id="redo-recording">  \
				            <div class="menu-row" style="cursor: pointer;"> \
				                <i class="fas fa-redo"></i> \
				                <p>REDO RECORDING</p> \
				            </div> </a> \
				        </div>')

	}
	$("body").on("click","#btn-startRecord",function(e){
		rec_type = $("#rtc-plugin #btn-startRecord").attr('data-recordtype')
		if ($(this).html() === 'Start Recording') {
			$(this).html("Stop Recording")
			var options = {
		      mimeType: rec_type, // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
		      audioBitsPerSecond: 228000,
		      videoBitsPerSecond: 228000,
		      bitsPerSecond: 228000 // if this line is provided, skip above two
		    };
		    recordRTC = RecordRTC(gstream, options);
		    recordRTC.startRecording();

		    if (rec_type == 'audio/webm'){
		    	$("#rtc-plugin .plugin-photo").html('<p>Your audio is being recorded..Click STOP when done.</p>')
		    }
		}else{					
			$(this).html("Start Recording")			
			if (rec_type == 'video/webm') $("#video-capture").attr('src','')
				
			var tracks = gstream.getTracks()
			for (i=0 ; i<tracks.length ; i++){
				tracks[i].stop()				
			}
			
			e.preventDefault();	  
			// showPreviewUI();
			$("#rtc-plugin").html('<div class="plugin-photo"></div>');
			if (rec_type == 'audio/webm'){
				$("#rtc-plugin .plugin-photo").html('<div id="waveform"></div>')
				wavesurfer = WaveSurfer.create({
				    container: '#waveform',
				    waveColor: 'violet',
				    progressColor: 'purple'
				});

				wavesurfer.on('ready', function () {
				    wavesurfer.play();
				});

				wavesurfer.on('finish',function(){
					showStopMenu();
				});

				recordRTC.stopRecording(function (audioVideoWebMURL) {				
					videourl = audioVideoWebMURL;		        
					var recordedBlob = 	recordRTC.getBlob();
					tmp_audio = recordedBlob;	
					recordRTC.getDataURL(function(dataURL) { 
			        	dataurl_audio = dataURL
			        });
					$("#rtc-plugin .plugin-photo p").remove()
					wavesurfer.load(audioVideoWebMURL);
				});
			} else if (rec_type == 'video/webm'){
				showStopMenu();
				

			    recordRTC.stopRecording(function (audioVideoWebMURL) {			        
			        videourl = audioVideoWebMURL;
			        var recordedBlob = recordRTC.getBlob();
			        tmp_video = recordedBlob;			        
			        recordRTC.getDataURL(function(dataURL) { 
			        	dataurl_video = dataURL
			        	console.log("DataURL="+dataURL)
			        });
			        // $("#video-preview").attr('src',videourl)
			    });
			}
			// $("#rtc-plugin .plugin-footer").attr('style','text-align: center;');
			// $("#rtc-plugin .plugin-footer").html('<a id="save-recording"> \
			// 								                <div class="plugin-bot" style="display:inline-block; cursor: pointer;"> \
			// 								                    Save \
			// 								                </div></a> \
			// 								                <a id="preview-recording"> \
			// 								            <div class="plugin-bot" style="display:inline-block; cursor: pointer;"> \
			// 								                Preview \
			// 								            </div></a> \
			// 								            <a id="redo-recording"> \
			// 								            <div class="plugin-bot" style="display:inline-block; cursor: pointer;"> \
			// 								                Redo \
			// 								            </div></a>');
		}
	});



	$('#rtc-form').submit(function(e){
	    e.preventDefault(); //Prevent the normal submission action
	 	// alert("Upload video attached to submit");
	 	var form = $('form')[0]; // You need to use standard javascript object here
		var formData = new FormData(form);
		uploadRTC(formData.get("Name"));
	});


	function showCanvas(){
		$("#rtc-plugin .plugin-photo").html('');
        $("#rtc-plugin .plugin-photo").append(canvas);

        setTimeout(function(){showStopMenu();},3000);
	}
	$("body").on("click","#take-picture",function(e){
		rec_type = "image/png"
		canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 120;
        canvas.id = "canvas_image"

        var context = canvas.getContext('2d');
        context.drawImage(document.getElementById('image-capture'), 0, 0, canvas.width, canvas.height);
        
       showCanvas();
        
		var track = gstream.getTracks()[0];
		track.stop();

		showStopMenu();

		// $("#rtc-plugin .plugin-footer").html('<a id="save-image"> \
	});

	$("body").on("click","#save-image",function(e){
		canvas = document.getElementById("canvas_image");
		if (canvas !== undefined){
			send_image = canvas.toDataURL('image/png');			
			showSave();
		}
	});

	function showImageCamera(){
		canvas_image = "";
		showPreviewUI();
		

		

		$("#rtc-plugin .plugin-photo").html('<video id="image-capture" width="180" height="120" autoplay></video>')
		$("#rtc-plugin .plugin-footer").html('<div class="plugin-bot shoot"> \
			                <a id="take-picture"><i class="fas fa-camera fa-x"></i></a> \
			            </div>')

		var mediaConstraints = { video: {width: 180, height: 120}, audio: false };
		navigator.mediaDevices.getUserMedia(mediaConstraints).then(function(stream){
			gstream = stream
			$("#image-capture").attr('src',URL.createObjectURL(stream))
		}).catch(errorCallback);
	}
	$("body").on("click","#capture-image,#redo-image",function(e){
		
		
		showImageCamera();

		// $("#rtc-page-image").show();
			
	});
	$("body").on("click","#redo-recording",function(e){
		if (rec_type == 'video/webm'){
			recordVideo();
		}else if (rec_type == 'audio/webm'){
			recordAudio();
		}else if (rec_type == 'image/png'){
			showImageCamera();
		}
	});

	$("body").on("click","#preview-recording",function(e){

		if (rec_type == 'video/webm'){
			$("#rtc-plugin").html('<div class="plugin-photo"></div>');
			$("#rtc-plugin .plugin-photo").html('<video id="video-preview" width="180" height="120" autoplay></video>');
				document.getElementById('video-preview').addEventListener('ended',function(){
					showStopMenu();
				},false);
			$("#video-preview").attr('src',videourl);

			
		    
		


		}else if (rec_type == 'audio/webm'){			
			// wavesurfer.play();

			$("#rtc-plugin .plugin-photo").html('<div id="waveform"></div>');
			wavesurfer = WaveSurfer.create({
			    container: '#waveform',
			    waveColor: 'violet',
			    progressColor: 'purple'
			});

			wavesurfer.on('ready', function () {
			    wavesurfer.play();
			});

			wavesurfer.on('finish',function(){
				showStopMenu();
			});

			wavesurfer.load(videourl);



		}else if (rec_type == 'image/png'){
			showCanvas();
		}
	});


	function uploadRTC(respondentName){
		var fd = new FormData();
		fd.append('respondent_name',respondentName)
		if (send_audio) fd.append('audio',send_audio);
		if (send_video) fd.append('video',send_video);
		if (send_image) fd.append('image',send_image);

		if (send_audio || send_video || send_image) {
			$("#rtc-plugin").html('<div class="under-percent"><p>Uploading..</p></div>');
	    	$.ajax({
		        url: 'https://script.google.com/macros/s/AKfycbwJciD8cbwuC79_xHWU-Izhyr1fnLwtybVeHxI9hYx4-3H-Ik8/exec',
		        type: 'post',
		        data: fd,
		        processData: false,
				contentType: false,
		        success: function(data) {
	               console.log(data)
	               $("#rtc-plugin").html('<div class="percent"><p>100%</p></div><div class="under-percent"><i class="fas fa-check-circle"></i><p>SUBMITTED</p></div>');
				   $("#rtc-plugin").attr('style','');
	               setTimeout(function(){
						// $("#rtc-success-upload").hide();
						showMenu();
	               },3000);
	             },
	             error: function(data){
	             	alert("Request Failed!");
	             	console.log(data);
	             }
		    });
		}
		return;
	}


	
	$("body").on("click","#save-recording",function(e){
		if (rec_type == 'audio/webm'){
			send_audio = dataurl_audio;
		} else if (rec_type == 'video/webm'){
			send_video = dataurl_video;
		}else if (rec_type == 'image/png'){
			if (canvas !== ""){
				send_image = canvas.toDataURL('image/png');
			}
		}


		
		showSave();
	});
});