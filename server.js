const express = require('express'),
      bodyParser = require('body-parser'),
      app = express();

const fetch = require('node-fetch');
const base64 = require('base64topdf');
var fs = require('file-system');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const streamPackage = require('stream');

app.get('/', (req, res) => {
	res.status(200).sendFile(__dirname + '/index.html');
});

app.get('/testGet', (req, res) => {
	res.status(200).send({
		name: "Steve",
		lastname: "Grant",
		alias: "Moonknight"
	});
});

app.post('/testPost', (req, res) => {
	const {name, lastname, alias} = req.body;
	console.log("name", name);
	res.status(200).send({
		name,
		lastname,
		alias
	});
});

app.get('/getPdfMinimalCodeWorking', async (req, res) => {
	// const url = 'https://ir.ua.edu/bitstream/handle/123456789/1236/file_1.pdf?sequence=1&isAllowed=y';
	const url = 'https://www.panini.es/media/paniniFiles/Novedades-Abril.pdf';
	
	const llamada = await fetch(url,
	{
		method: 'GET',
		header: 'Content-Type:application/pdf',
	});
	
	const stream = llamada.body;
	
	return stream.pipe(res);
});

app.get('/getPdfTest', async (req, res) => {
	// const url = 'https://ir.ua.edu/bitstream/handle/123456789/1236/file_1.pdf?sequence=1&isAllowed=y';
	const url = 'https://www.panini.es/media/paniniFiles/Novedades-Abril.pdf';
	
	const llamada = await fetch(url,
	{
		method: 'GET',
		header: 'Content-Type:application/pdf',
	});
	
	const stream = llamada.body;
	
	
	return res.status(200).send(stream);
});

app.get('/getPdfWorkingWithChunks', async (req, res) => {
	// const url = 'https://ir.ua.edu/bitstream/handle/123456789/1236/file_1.pdf?sequence=1&isAllowed=y';
	const url = 'https://www.panini.es/media/paniniFiles/Novedades-Abril.pdf';
	
	res.set({'Content-Type': 'application/pdf'});
	
	const llamada = fetch(url,
	{
		method: 'GET',
		header: 'Content-Type:application/pdf',
	}).then(async (resp) => {
		const stream = resp.body;		
		
		stream.on('data', function(chunk) {			
			res.write(chunk);		
		});
	
		stream.on('end', function(chunk) {
			req.pipe(res);			
		});
	});
});


app.get('/getPdfMinimalCodeWorkingContentLength', async (req, res) => {
	// const url = 'https://ir.ua.edu/bitstream/handle/123456789/1236/file_1.pdf?sequence=1&isAllowed=y';
	const url = 'https://www.panini.es/media/paniniFiles/Novedades-Abril.pdf';
	
	const llamada = await fetch(url,
	{
		method: 'GET',
		header: 'Content-Type:application/pdf',
	});
	
	const stream = llamada.body;
	
	let chunksArr = [];
	let chunks = [];
	let downloaded = 0;
	
	console.log(stream);
	
	const readable = new streamPackage.Readable(stream);
	
	try {
		console.log("res.bytes", res.byteLength);
		console.log("stream.length", stream.byteLength);
		console.log("stream.size", stream.size);
		console.log("req.headers['content-length']", req.headers['content-length']);
		console.log("readableLength", readable.readableLength);
		
	} catch(err) {
		console.log("error: ", err);
	}
	
	//res.set({'Content-Type': 'application/pdf', 'Content-Length': res.bytes, 'Content-Disposition': 'inline; filename=fileName.pdf'});   
	
	
	
	res.on('data', function(chunk){
      downloaded += chunk.length;
	  chunksArr.push(chunk);
	  console.log("pasamos por aqui - res.on.data");
    });
	
	res.on('readable', () => {
	  let rchunk;
	  console.log('Stream is now readable');
	  while (null !== (rchunk = readable.read(8))) {
		console.log(`Chunk read: ${rchunk}`)
		chunks.push(rchunk)
	  }
	  console.log(`Null returned`)
	});
	
	stream.once('end', () => {
	  const fileBuffer = Buffer.concat(chunks);
	  
	  const file_content = chunks.join('');

	  console.log('final buffer length: ', fileBuffer.byteLength);
	  
	  console.log("chunks", chunks);
	  
	  console.log("file_content.length", file_content.length);
	});
		
	stream.pipe(res);
	
	console.log("final size: ", downloaded);
});

app.get('/getPdfStreamOnlySmallFiles', async (req, res) => {
	// const url = 'https://ir.ua.edu/bitstream/handle/123456789/1236/file_1.pdf?sequence=1&isAllowed=y';
	const url = 'https://www.panini.es/media/paniniFiles/Novedades-Abril.pdf';
	
	const llamada = await fetch(url,
	{
		method: 'GET',
		header: 'Content-Type:application/pdf',
	});
	
	const bodyStream = llamada.body;
	
	const blobStream = new Blob([llamada.body], { type: 'application/pdf'}).stream();
	
	console.log("pasamos por aqui - blobStream pipe res");
	
	await blob.pipe(res);
	
	return res.end();
});

app.get('/getPdf', (req, res) => {
	// const url = 'https://ir.ua.edu/bitstream/handle/123456789/1236/file_1.pdf?sequence=1&isAllowed=y';
    // const url = 'https://www.is4k.es/sites/default/files/contenidos/los_vengadores_acoso_nunca_mas_marvel_panini_is4k.pdf';
    const url = 'https://www.panini.es/media/paniniFiles/Novedades-Abril.pdf';
  const llamada = fetch(url,
	{
		method: 'GET',
		header: 'Content-Type:application/pdf',
	});

llamada.then(res => res.arrayBuffer())
.then((data) => {
	console.log('first data', data);
                    var base64Str = Buffer.from(data).toString('base64');
                    var result = base64.base64Decode(base64Str, 'fileDecoded.pdf');
					
					var dataToSend = fs.readFileSync(__dirname + '/fileDecoded.pdf');

					res.set({'Content-Type': 'application/pdf', 'Content-Length': dataToSend.length, 'Content-Disposition': 'inline; filename=fileName.pdf'});	

					try {
					  fs.unlinkSync('fileDecoded.pdf')
					  //file removed
					} catch(err) {
					  console.error(err)
					}
					
					return res.status(200).send(dataToSend);
                })
  
});

app.get('/getPdfOnTheFly', (req, res) => {
	//const url = 'https://ir.ua.edu/bitstream/handle/123456789/1236/file_1.pdf?sequence=1&isAllowed=y';
	//const url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';
	//const url = 'http://openaccess.uoc.edu/webapps/o2/bitstream/10609/17885/1/mtrigasTFC0612memoria.pdf';
	//const url = "https://scrummanager.net/files/scrum_master.pdf";
	//const url = 'https://www.dc.fi.udc.es/ai/~cabalar/md/scrum.pdf';
	
	//const url = 'https://www.ockelcomputers.com/downloads/windows-reinstallation-guide.pdf';
	//const url = 'https://www.gigabyte.com/FileUpload/jp/Microsite/206/images/windows7_cleaninstall_xp_sop_en.pdf?issue_id=7619084';
	
	//const url = 'https://www.is4k.es/sites/default/files/contenidos/los_vengadores_acoso_nunca_mas_marvel_panini_is4k.pdf';
	//const url = 'https://www.lacasadeel.net/wp-content/uploads/2021/12/PANINI-COMICS-ESPANA-AVANCE-DEL-PLAN-EDITORIAL-MARVEL-2022.pdf';
	const url = 'https://www.panini.es/media/paniniFiles/Novedades-Abril.pdf';
	
	const llamada = fetch(url,
		{
			method: 'GET',
			header: 'Content-Type:application/pdf',

		}
	).catch(err => console.log(err));	
	
	/*function toBuffer(ab) {
		var buf = new Buffer(ab.byteLength);
		var view = new Uint8Array(ab);
		for (var i = 0; i < buf.length; ++i) {
			buf[i] = view[i];
		}
		return buf;
	}*/
	
	llamada
	.then(async (resp) => {
		const respBody = resp.body;
		const response = await resp.arrayBuffer();
		const customBody = response.body;
		
		//const pruebaArrayBufferToBuffer = toBuffer(response);
		const pruebaArrayBufferToBuffer = Buffer.from(response);
		
		console.log("pruebaArrayBufferToBuffer: ", pruebaArrayBufferToBuffer);
		
		var base64StrWithoutPrefix = Buffer.from(response).toString('base64');
		var base64Str = 'data:application/pdf;base64,' + base64StrWithoutPrefix;
				
		//res.set({'Content-Type': 'application/pdf', 'Content-Length': totalLength, 'Content-Disposition': 'attachment; filename=fileName.pdf'});  // application/octet-stream
		res.set({'Content-Type': 'application/pdf', 'Content-Length': response.byteLength, 'Content-Disposition': 'inline; filename=fileName.pdf'});
		
		console.log("base64StrWithoutPrefix", base64StrWithoutPrefix);
		

		return res.status(200).send(pruebaArrayBufferToBuffer);
	})
	
});

app.get('/downloadPdf', (req, res) => {
	//const url = 'https://ir.ua.edu/bitstream/handle/123456789/1236/file_1.pdf?sequence=1&isAllowed=y';
	//const url = 'https://www.gigabyte.com/FileUpload/jp/Microsite/206/images/windows7_cleaninstall_xp_sop_en.pdf?issue_id=7619084';
	//const url = 'https://www.is4k.es/sites/default/files/contenidos/los_vengadores_acoso_nunca_mas_marvel_panini_is4k.pdf';
	//const url = 'https://www.lacasadeel.net/wp-content/uploads/2021/12/PANINI-COMICS-ESPANA-AVANCE-DEL-PLAN-EDITORIAL-MARVEL-2022.pdf';
	const url = 'https://www.panini.es/media/paniniFiles/Novedades-Abril.pdf';
	
	const llamada = fetch(url,
		{
			method: 'GET',
			header: 'Content-Type:application/pdf',

		}
	).catch(err => console.log(err));
	
	llamada
	.then(async (resp) => {
		const respBody = resp.body;
		const response = await resp.arrayBuffer();
		
		var base64Str = Buffer.from(response).toString('base64');
		var decodedBase64 = base64.base64Decode(base64Str, 'decodedBase64.pdf');
		
		var pathPDFDecoded = __dirname + '/decodedBase64.pdf';
		
		var dataToSend = fs.readFileSync(pathPDFDecoded);		
		const pruebaArrayBufferToBuffer = Buffer.from(response);

		res.set({'Content-Type': 'application/pdf', 'Content-Length': dataToSend.length }); //, 'Content-Disposition': 'attachment; filename=fileNameDownloadedNew.pdf'});			
		res.attachment("/decodedBase64.pdf");
		
		
		
        res.download(pathPDFDecoded, function (err) {
		   if (err) {
			   console.log("Error");
			   console.log(err);
		   } else {
			   console.log("Success");
			   try {
				  fs.unlinkSync('decodedBase64.pdf');
				  //file removed
				} catch(err) {
				  console.error(err)
				}
		   }    
		});	
	});	
});

app.listen(9000,()=>{
    console.log('Servidor iniciado en el puerto 9000') 
});



// El error del worker ocurria cuando hybris esta caido.
// El worker de produccion sigue siendo el antiguo