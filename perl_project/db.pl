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

#ADMIN SIDE
# Route to add a category
post '/add-category' => sub ($c) {
    my $json = $c->req->json;

    my $result = CRUD::createCategory($dbh, $json);

    $c->render(json => $result);
};

# Route to add a session
post '/add-session' => sub ($c) {
    my $json = $c->req->json;

    my $result = CRUD::createSession($dbh, $json);

    $c->render(json => $result);
};
# Route to get all categories
get '/get-category' => sub ($c) {
    my $categories = CRUD::getAll($dbh, 'category');
    $c->render(json => $categories);
};

# Route to get all sessions
get '/get-session' => sub ($c) {
    my $sessions = CRUD::getAll($dbh, 'session');
    $c->render(json => $sessions);
};


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
    my $jsonStr = $c->req->body;

    unless ($jsonStr) {
        return $c->render(json => { success => 0, error => 'Missing request body' }, status => 400);
    }

    my $json = eval { decode_json($jsonStr) };
    if ($@) {
        return $c->render(json => { success => 0, error => 'Invalid JSON format' }, status => 400);
    }

    unless ($json->{table} && $json->{id} && $json->{data}) {
        return $c->render(
            json => { success => 0, error => 'Missing table, ID, or data' },
            status => 400
        );
    }

    my $result = CRUD::updateJSON($dbh, $json);
    $c->render(json => $result);
};



### http://localhost:3000/delete?jsonStr={"table":"gdlinks", "id":15}
# GET route for /delete
get '/delete' => sub ($c) {
    my $jsonStr = $c->param('jsonStr');

    unless ($jsonStr) {
        return $c->render(json => { success => 0, error => 'Missing jsonStr parameter' }, status => 400);
    }

    my $json = eval { decode_json($jsonStr) };
    if ($@) {
        return $c->render(json => { success => 0, error => 'Invalid JSON format' }, status => 400);
    }

    unless ($json->{table} && $json->{id}) {
        return $c->render(json => { success => 0, error => 'Missing table or ID' }, status => 400);
    }

    my $result = CRUD::deleteJSON($dbh, $json);
    $c->render(json => $result);
};

# POST route for /delete
post '/delete' => sub ($c) {
    my $jsonStr = $c->req->body;

    unless ($jsonStr) {
        return $c->render(json => { success => 0, error => 'Missing request body' }, status => 400);
    }

    my $json = eval { decode_json($jsonStr) };
    if ($@) {
        return $c->render(json => { success => 0, error => 'Invalid JSON format' }, status => 400);
    }

    unless ($json->{table} && $json->{id}) {
        return $c->render(json => { success => 0, error => 'Missing table or ID' }, status => 400);
    }

    my $result = CRUD::deleteJSON($dbh, $json);
    $c->render(json => $result);
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