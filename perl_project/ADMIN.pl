package ADMIN;

use JSON::XS;


#ADMIN SIDE
# Function to add a category
sub createCategory {
    my ($dbh, $json) = @_;

    my $category_name = $json->{'category_name'};
    my $sth = $dbh->prepare('INSERT INTO category (category_name) VALUES (?)');

    unless ($sth) {
        return {
            success => 0,
            error   => "Prepare statement failed: " . $dbh->errstr,
        };
    }

    my $success = $sth->execute($category_name);

    unless ($success) {
        return {
            success => 0,
            error   => "Execution failed: " . $dbh->errstr,
        };
    }

    return {
        success   => 1,
        operation => "CREATE",
        inserted  => { category_name => $category_name },
    };
}

# Function to add a session
sub createSession {
    my ($dbh, $json) = @_;

    my $session_name = $json->{'session_name'};
    my $sth = $dbh->prepare('INSERT INTO session (session_name) VALUES (?)');

    unless ($sth) {
        return {
            success => 0,
            error   => "Prepare statement failed: " . $dbh->errstr,
        };
    }

    my $success = $sth->execute($session_name);

    unless ($success) {
        return {
            success => 0,
            error   => "Execution failed: " . $dbh->errstr,
        };
    }

    return {
        success   => 1,
        operation => "CREATE",
        inserted  => { session_name => $session_name },
    };
}
# Function to get all rows from a table
sub readCategory {
    my $dbh = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    if ($table eq "category") {
        my $sth = $dbh->prepare('SELECT * FROM category');
        $sth->execute() or die 'execution failed: ' . $dbh->errstr();
        
        my $categories = $sth->fetchall_arrayref({});  # Fetch results as an array of hashes

        return { categories => $categories };  # Return categories wrapped in a "categories" key
    }
    
    return {
        success => 0,
        error   => "Unsupported table: $table",
    };
}
sub readSession {
    my $dbh = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    if ($table eq "session") {
        my $sth = $dbh->prepare('SELECT * FROM session');
        $sth->execute() or die 'execution failed: ' . $dbh->errstr();
        
        my $sessions = $sth->fetchall_arrayref({});

        return { sessions => $sessions }; 
    }
    
    return {
        success => 0,
        error   => "Unsupported table: $table",
    };
}

#Function Delete
sub deleteCategory {
    my $dbh = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    my $id = $json->{'id'};

    if ($table eq "category") {
        # Check if category exists
        my $sth_check = $dbh->prepare('SELECT COUNT(*) FROM category WHERE categoryID=?');
        $sth_check->execute($id);
        my ($count) = $sth_check->fetchrow_array();

        unless ($count) {
            return { success => 0, error => "Category not found" };
        }

        # Delete from category table
        my $sth_category = $dbh->prepare('DELETE FROM category WHERE categoryID=?');
        $sth_category->execute($id) or die 'execution failed: ' . $dbh->errstr();

        return { success => 1, operation => "DELETE", id => $id };
    }
    
    return {
        success => 0,
        error   => "Unsupported table: $table",
    };
}
sub deleteSession {
    my $dbh = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    my $id = $json->{'id'};

    if ($table eq "session") {
        # Check if session exists
        my $sth_check = $dbh->prepare('SELECT COUNT(*) FROM session WHERE sessionID=?');
        $sth_check->execute($id);
        my ($count) = $sth_check->fetchrow_array();

        unless ($count) {
            return { success => 0, error => "Session not found" };
        }

        # Delete from session table
        my $sth_session = $dbh->prepare('DELETE FROM session WHERE sessionID=?');
        $sth_session->execute($id) or die 'execution failed: ' . $dbh->errstr();

        return { success => 1, operation => "DELETE", id => $id };
    }
    
    return {
        success => 0,
        error   => "Unsupported table: $table",
    };
}
# Function to fetch users by role
sub getUsersByRole {
    my $dbh = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    my $userID = $json->{'userID'};

    if ($table eq "users") {
        my $sth = $dbh->prepare('SELECT * FROM users');
        $sth->execute() or die 'execution failed: ' . $dbh->errstr();
        return $sth->fetchall_arrayref({});

    }
    return {
        success => 0,
        error   => "Unsupported table: $table",
    };
}

# Fetch user counts grouped by role
sub getUserCounts {
    my ($dbh) = @_;

    # Query to count users by role
    my $query = 'SELECT role, COUNT(*) AS count FROM users GROUP BY role';
    my $sth = $dbh->prepare($query);

    $sth->execute();

    # Fetch results
    my %counts;
    while (my $row = $sth->fetchrow_hashref) {
        $counts{$row->{role}} = $row->{count};
    }

    $sth->finish();

    # Return counts as a JSON string
    return encode_json({ success => 1, data => \%counts });
}


1;