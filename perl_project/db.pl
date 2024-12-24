use Mojolicious::Lite -signatures;
use DBI;
use JSON::XS;

require("./CRUD.pl");

# Connect to the database.
my $database = 'ad_gdlinks';
my $user = 'admin';
my $pass = '12345678';
my $dbh = DBI->connect("DBI:MariaDB:database=$database;host=localhost", $user, $pass, { RaiseError => 1, PrintError => 0 });


#my $json = decode_json('{"category":"Research"}');

get '/' => {text => 'GD Links AJAX/JSON Service'};

### http://localhost:3000/create?jsonStr={"category":"Internship", "ref_name":"Evaluation Form", "sessem":"2023/2024-1", "description":"Borang Penilaian Latihan Industri oleh Penyelia Fakulti", "owner":"norsham@utm.my", "link":"https://forms.gle/"}
### http://localhost:3000/create?jsonStr={"table":"gdlinks", "data":{"category":"Internship", "ref_name":"Visit Form", "sessem":"2023/2024-1", "description":"Borang lawatan latihan praktik", "owner":"norsham@utm.my", "link":"https://forms.gle/"}}
get '/create' => sub ($c) {
    my $jsonStr = $c->param('jsonStr');

    my $json = decode_json($jsonStr);
    ##$json->{'data'}->{'userID'} = $c->session('userID');
    my $result = CRUD::createJSON($dbh, $json);

    #$c->render(text=>"create $jsonStr");
    print $result;
    $c->render(json=>$result);
};

post '/createLink' => sub ($c) {
    my $jsonStr = $c->req->body;  # Use the request body directly here, instead of params
    my $json = decode_json($jsonStr);
    my $userID = $json->{data}->{userID};
    print "Received JSON: $jsonStr\n";  # Debugging: print the raw JSON string to check if it's being received properly
    print "Received userID: $userID\n";
    #my $json;
    #eval {
    #    $json = decode_json($jsonStr);  # Decode the incoming JSON string
    #};
    #if ($@) {
    #    print "Error parsing JSON: $@\n";  # Print any error if JSON is malformed
    #    $c->render(json => { error => "Malformed JSON" });
    #    return;
    #}
    
    #$json->{data}->{userID} = $c->session(userID);
    print "Received userID in db.pl: " . $json->{'data'}->{'userID'} . "\n";
    my $result = CRUD::createJSON($dbh, $json);

    #$c->render(text=>"create $jsonStr");
    print $result;
    $c->render(json=>$result);
};

### http://localhost:3000/read?jsonStr={"table":"gdlinks"}
get '/read' => sub ($c) {
    my $jsonStr = $c->param('jsonStr');

    my $json = decode_json($jsonStr);
    #my $userID = $c->session('userID');
    print "Received userID in read: ".$json->{'userID'}."\n";
     
    my $result = CRUD::readJSON($dbh, $json);##it will call the readJSON from CRUD.pl
    $c->render(json=>$result);
};

### http://localhost:3000/create?jsonStr={"table":"gdlinks", "id":13, "data":{"category":"Internship", "ref_name":"Visit Form", "sessem":"2023/2024-1", "description":"Borang lawatan latihan praktik", "owner":"mrazak@utm.my", "link":"https://forms.gle/"}}
get '/update' => sub ($c) {
    my $jsonStr = $c->param('jsonStr');

    my $json = decode_json($jsonStr);
    my $result = CRUD::updateJSON($dbh, $json);
    $c->render(json=>$result);
};

post '/updateLink' => sub ($c) {
    my $jsonStr = $c->param('jsonStr');

    my $json = decode_json($jsonStr);
    my $result = CRUD::updateJSON($dbh, $json);
    $c->render(json=>$result);
};


### http://localhost:3000/delete?jsonStr={"table":"gdlinks", "id":15}
get '/delete' => sub ($c) {
    my $jsonStr = $c->param('jsonStr');

    my $json = decode_json($jsonStr);
    my $result = CRUD::deleteJSON($dbh, $json);

    $c->render(json=>$result);
};

### http://localhost:3000/check?jsonStr={"username":"B23CS0036","password":"020618010998"}
get '/check' => sub ($c) {
    my $jsonStr = $c->param('jsonStr');

    # Decode the JSON string
    my $json = decode_json($jsonStr);

    # Call the checkJSON function from CRUD
    my $result = CRUD::checkJSON($dbh, $json);

    # Render the JSON response
    $c->render(json => $result);
};

app->start;