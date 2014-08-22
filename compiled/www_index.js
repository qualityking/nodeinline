exports.loadPage = function (request,response) {
print();
function print()
{
for(i=0;i<=10;i++)
{
response.write('<h2> Manish Bansal  ' + i+ ' </h2>'); 

}
}
response.write('<a href="contactus.html">  contact page </a>'); 
}