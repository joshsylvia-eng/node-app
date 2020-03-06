
var https = require('https');
var fs = require('fs');

const options = {
  key: fs.readFileSync('certs/key.pem'),
  cert: fs.readFileSync('certs/cert.pem')
};

var server = https.createServer(options, function (req, resp) {
    
    if (req.url === "/") {
        fs.readFile("head-nav/head-nav.html", function (error, pgResp) {
            if (error) {
                resp.writeHead(404);
                resp.write('Contents you are looking are Not Found');
            } else {
                resp.writeHead(200, { 'Content-Type': 'text/html' });
                resp.write(pgResp);
            }
             
            resp.end();
        });
    } else {
        
        resp.writeHead(200, { 'Content-Type': 'text/html' });
        resp.write('<h1>Product Manaager</h1><br /><br />To create product please enter: ' + req.url);
        resp.end();
    }
});

server.listen(8000);
 
console.log('Server Started listening on 8000');