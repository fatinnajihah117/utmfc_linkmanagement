package CRUD;

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
sub getAll {
    my ($dbh, $table) = @_;
    my $sth = $dbh->prepare("SELECT * FROM $table");

    unless ($sth) {
        return { error => "Prepare statement failed: " . $dbh->errstr };
    }

    $sth->execute();
    my $rows = $sth->fetchall_arrayref({});
    return $rows;
}

#USER SIDE
sub createJSON {
    my $dbh  = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    my $data  = $json->{'data'};

    if ($table eq "link") {
        my $sth = $dbh->prepare(
            'INSERT INTO link (category, session, description, owner, links) VALUES (?, ?, ?, ?, ?)'
        );

        unless ($sth) {
            return {
                success => 0,
                error   => "Prepare statement failed: " . $dbh->errstr,
            };
        }

        my $success = $sth->execute(
            $data->{'category'}, $data->{'session'}, $data->{'description'},
            $data->{'owner'}, $data->{'links'}
        );

        unless ($success) {
            return {
                success => 0,
                error   => "Execution failed: " . $dbh->errstr,
            };
        }

        # Now, associate the link with the user in the user_link table
        my $sth_link = $dbh->prepare('SELECT LAST_INSERT_ID()');
        $sth_link->execute();
        my ($linkID) = $sth_link->fetchrow_array();

        my $sth_user_link = $dbh->prepare(
            'INSERT INTO user_link (userID, linkID) VALUES (?, ?)'
        );
        $sth_user_link->execute($data->{'userID'}, $linkID);

        return {
            success   => 1,
            operation => "CREATE",
            inserted  => $data,
        };
        
    } elsif ($table eq "users") {
        my $sth = $dbh->prepare(
            'INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)'
        );

        unless ($sth) {
            return {
                success => 0,
                error   => "Prepare statement failed: " . $dbh->errstr,
            };
        }

        my $success = $sth->execute(
            $data->{'username'}, $data->{'password'}, $data->{'email'},
            $data->{'full_name'}, $data->{'role'}
        );

        unless ($success) {
            return {
                success => 0,
                error   => "Execution failed: " . $dbh->errstr,
            };
        }

        return {
            success   => 1,
            operation => "CREATE",
            inserted  => $data,
        };
    }

    return {
        success => 0,
        error   => "Unsupported table: $table",
    };
}

sub readJSON {
    my $dbh = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    my $userID = $json->{'userID'};
    if ($table eq "link") {
        my $sth = $dbh->prepare(
            'SELECT * FROM link 
             JOIN user_link ON link.linkID = user_link.linkID
             WHERE user_link.userID = ?'
        );
        $sth->execute($userID) or die 'execution failed: ' . $dbh->errstr();
        return $sth->fetchall_arrayref({});

    } elsif ($table eq "category") {
        # Fetch all category names from the category table
        my $sth = $dbh->prepare('SELECT category_name FROM category');
        $sth->execute() or die 'execution failed: ' . $dbh->errstr();
        # Collect all category names into an array of strings
        my @categories;
        while (my $row = $sth->fetchrow_hashref) {
            push @categories, $row->{'category_name'};
        }
        # Return the array of category names as a JSON array
        return { categories => \@categories };
    } elsif ($table eq "session") {
        # Fetch all session names from the category table
        my $sth = $dbh->prepare('SELECT session_name FROM session');
        $sth->execute() or die 'execution failed: ' . $dbh->errstr();
        # Collect all session names into an array of strings
        my @sessions;
        while (my $row = $sth->fetchrow_hashref) {
            push @sessions, $row->{'session_name'};
        }
        # Return the array of session names as a JSON array
        return { sessions => \@sessions };
    } elsif ($table eq "users") {
        my $sth = $dbh->prepare('SELECT * FROM users') or die 'prepare statement failed: ' . $dbh->errstr();
        $sth->execute() or die 'execution failed: ' . $dbh->errstr();
        return $sth->fetchall_arrayref({});
    }

    return {
        success => 0,
        error   => "Unsupported table: $table",
    };
}

sub updateJSON {
    my $dbh = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    my $data = $json->{'data'};
    my $id =  $json->{'id'};

    if ($table eq "link") {
        my $sth = $dbh->prepare(
            'UPDATE link SET category=?, session=?, description=?, owner=?, links=? WHERE linkID=?'
        ) or die 'prepare statement failed: ' . $dbh->errstr();

        $sth->execute(
            $data->{'category'}, $data->{'session'}, $data->{'description'},
            $data->{'owner'}, $data->{'links'}, $id
        ) or die 'execution failed: ' . $dbh->errstr();

        $json->{'operation'} = "UPDATE";
        return $json;
    } elsif ($table eq "users") {
        my $sth = $dbh->prepare(
            'UPDATE users SET username=?, password=?, email=?, full_name=?, role=? WHERE userID=?'
        ) or die 'prepare statement failed: ' . $dbh->errstr();

        $sth->execute($data->{'username'}, $data->{'password'}, $data->{'email'}, 
                      $data->{'full_name'}, $data->{'role'}, $id) or die 'execution failed: ' . $dbh->errstr();

        $json->{'operation'} = "UPDATE";
        return $json;
    }

    return {
        success => 0,
        error   => "Unsupported table: $table",
    };
}

sub deleteJSON {
    my $dbh = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    my $id = $json->{'id'};
    my $userID = $json->{'userID'};

    if ($table eq "link") {
        # Validate the user has permission to delete the link
        my $sth_check = $dbh->prepare('SELECT COUNT(*) FROM user_link WHERE linkID=? AND userID=?');
        $sth_check->execute($id, $userID);
        my ($count) = $sth_check->fetchrow_array();

        unless ($count) {
            return { success => 0, error => "Permission denied or record not found" };
        }

        # Delete from user_link
        my $sth_user_link = $dbh->prepare('DELETE FROM user_link WHERE linkID=?');
        $sth_user_link->execute($id) or die 'execution failed: ' . $dbh->errstr();

        # Delete from link
        my $sth_link = $dbh->prepare('DELETE FROM link WHERE linkID=?');
        $sth_link->execute($id) or die 'execution failed: ' . $dbh->errstr();

        return { success => 1, operation => "DELETE", id => $id };
    }

    return {
        success => 0,
        error   => "Unsupported table: $table",
    };
}

sub checkJSON {
    my $dbh  = shift(@_);
    my $json = shift(@_);

    my $username = $json->{'username'};
    my $password = $json->{'password'};

    unless ($username && $password) {
        return {
            success => 0,
            error   => "Missing username or password",
        };
    }

    # Query the database for matching user credentials
    my $sth = $dbh->prepare('SELECT * FROM users WHERE username = ? AND password = ?');
    $sth->execute($username, $password) or die "Execution failed: " . $dbh->errstr;

    my $result = $sth->fetchall_arrayref({});

    # Return the result
    if (@$result) {
        return {
            success   => 1,
            userExists => 1,
            userData  => $result->[0], # Return the first matching user
        };
    } else {
        return {
            success   => 1,
            userExists => 0,
        };
    }
}

1;
