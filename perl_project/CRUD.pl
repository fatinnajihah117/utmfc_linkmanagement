package CRUD;

use JSON::XS;

#USER SIDE
# Function to get all rows from a table
sub checkGroupsJSON {
    my ($dbh, $userEmail) = @_;
    my $sth = $dbh->prepare(
        'SELECT DISTINCT g.groupID, g.group_name, g.description, g.owner, g.session 
         FROM groups g
         LEFT JOIN user_group ug ON g.groupID = ug.groupID
         WHERE g.owner = ? OR ug.userID = ?'
    );

    $sth->execute($userEmail, $userEmail);

    my @groups;
    while (my $row = $sth->fetchrow_hashref) {
        push @groups, $row;
    }

    return \@groups;
}

sub createJSON {
    my $dbh  = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    my $data  = $json->{'data'};

    if ($table eq "link") {
        my $sth = $dbh->prepare(
            'INSERT INTO link (category, session, description, owner, links) VALUES (?, ?, ?, ?, ?)'
        );

        my $success = $sth->execute(
            $data->{'category'}, $data->{'session'}, $data->{'description'},
            $data->{'owner'}, $data->{'links'}
        );

        unless ($success) {
            return {success => 0,error   => "Execution failed: " . $dbh->errstr,};
        }

        # Now, associate the link with the user in the user_link table
        my $sth_link = $dbh->prepare('SELECT LAST_INSERT_ID()');
        $sth_link->execute();
        my ($linkID) = $sth_link->fetchrow_array();

        my $sth_user_link = $dbh->prepare(
            'INSERT INTO user_link (userID, linkID) VALUES (?, ?)'
        );
        $sth_user_link->execute($data->{'userEmail'}, $linkID);

        return {success   => 1,operation => "CREATE",inserted  => $data,};
        
    } elsif ($table eq "users") {
        # my $sth = $dbh->prepare(
        #     'INSERT INTO users (username, email, full_name, role) VALUES (?, ?, ?, ?)'
        # );

        # my $success = $sth->execute(
        #     $data->{'username'}, $data->{'email'},
        #     $data->{'full_name'}, $data->{'role'}
        # );

        # unless ($success) {
        #     return {success => 0,error   => "Execution failed: " . $dbh->errstr,};
        # }
        # return {success   => 1,operation => "CREATE",inserted  => $data,};

        use Digest::SHA qw(sha256_hex);
        #my $hashed_password = sha256_hex($data->{'password'});

        my $sth = $dbh->prepare(
            'INSERT INTO users (username, email, full_name, role, password) VALUES (?, ?, ?, ?, ?)'
        );

        my $success = $sth->execute(
            $data->{'username'}, $data->{'email'},
            $data->{'full_name'}, $data->{'role'}, $data->{'password'}
        );

        unless ($success) {
            return {success => 0, error => "Execution failed: " . $dbh->errstr};
        }
        return {success => 1, operation => "CREATE", inserted => $data};

    }elsif($table eq "groups"){
        # Insert into groups table
        my $sth = $dbh->prepare(
            'INSERT INTO groups (group_name, description, owner, session) VALUES (?, ?, ?, ?)'
        );

        my $success = $sth->execute(
            $data->{'group_name'}, $data->{'description'}, $data->{'owner'},
            $data->{'session'}
        );

        unless ($success) {
            return {success => 0,error   => "Execution failed: " . $dbh->errstr,};
        }

        # Get the last inserted groupID
        my $sth_group = $dbh->prepare('SELECT LAST_INSERT_ID()');
        $sth_group->execute();
        my ($groupID) = $sth_group->fetchrow_array();

        # Insert participants into user_group table
        my $sth_user_group = $dbh->prepare(
            'INSERT INTO user_group (userID, groupID) VALUES (?, ?)'
        );

        foreach my $userID (@{ $data->{'participants'} }) {
            $sth_user_group->execute($userID, $groupID);
        }

        return {success   => 1, operation => "CREATE", inserted  => { groupID => $groupID, %$data },};
    }elsif ($table eq "link_group") {
        # Insert the new link into the link table
        my $sth_link = $dbh->prepare(
            'INSERT INTO link (category, session, description, owner, links) VALUES (?, ?, ?, ?, ?)'
        );

        my $success_link = $sth_link->execute(
            $data->{'category'}, $data->{'session'}, $data->{'description'},
            $data->{'owner'}, $data->{'links'}
        );

        unless ($success_link) {
            return {success => 0, error => "Execution failed: " . $dbh->errstr};
        }

        # Get the last inserted linkID
        my $sth_last_id = $dbh->prepare('SELECT LAST_INSERT_ID()');
        $sth_last_id->execute();
        my ($linkID) = $sth_last_id->fetchrow_array();

        # Insert the linkID and groupID into the link_group table
        my $sth_link_group = $dbh->prepare(
            'INSERT INTO link_group (linkID, groupID) VALUES (?, ?)'
        );

        my $success_link_group = $sth_link_group->execute($linkID, $data->{'groupID'});

        unless ($success_link_group) {
            return {success => 0, error => "Execution failed for link_group: " . $dbh->errstr};
        }

        # Fetch all participants' userIDs from the user_group table for the given groupID
        my $sth_participants = $dbh->prepare(
            'SELECT userID FROM user_group WHERE groupID = ?'
        );
        $sth_participants->execute($data->{'groupID'});

        my @participants;
        while (my ($userID) = $sth_participants->fetchrow_array()) {
            push @participants, $userID;
        }

        # Insert the linkID for each participant and the link owner into the user_link table
        my $sth_user_link = $dbh->prepare(
            'INSERT INTO user_link (userID, linkID) VALUES (?, ?)'
        );

        foreach my $userID (@participants, $data->{'userEmail'}) {
            $sth_user_link->execute($userID, $linkID);
        }

        return {success => 1, operation => "CREATE", inserted => { linkID => $linkID, groupID => $data->{'groupID'}, %$data }};
    }elsif($table eq "user_group") {
        my $groupID = $data->{'groupID'};
        # Insert participants into user_group table
        my $sth_user_group = $dbh->prepare(
            'INSERT INTO user_group (userID, groupID) VALUES (?, ?)'
        );

        foreach my $userID (@{ $data->{'participants'} }) {#participants is when i declare at jsonStr data at createGroup()
            $sth_user_group->execute($userID, $groupID);
        }

        # Fetch all linkIDs associated with the groupID
        my $sth_links = $dbh->prepare(
            'SELECT linkID FROM link_group WHERE groupID = ?'
        );
        $sth_links->execute($data->{'groupID'});

        my @linkIDs;
        while (my ($linkID) = $sth_links->fetchrow_array()) {
            push @linkIDs, $linkID;
        }

        # Insert the linkIDs into user_link table for each new participant
        my $sth_user_link = $dbh->prepare(
            'INSERT INTO user_link (userID, linkID) VALUES (?, ?)'
        );

        foreach my $userID (@{ $data->{'participants'} }) {
            foreach my $linkID (@linkIDs) {
                $sth_user_link->execute($userID, $linkID);
            }
        }

        return {success => 1, operation => "CREATE", inserted => { groupID => $data->{'groupID'}, participants => $data->{'participants'} }};
    }elsif($table eq "user_link") {
        my $linkID = $data->{'linkID'};
        # Insert participants into user_group table
        my $sth_user_group = $dbh->prepare(
            'INSERT INTO user_link (userID, linkID) VALUES (?, ?)'
        );

        foreach my $userID (@{ $data->{'participants'} }) {
            $sth_user_group->execute($userID, $linkID);
        }

        return {success => 1, operation => "CREATE", inserted => { linkID => $data->{'linkID'}, participants => $data->{'participants'} }};
    }elsif($table eq "shareLinkGroup") {
        my $linkID    = $json->{'linkID'};
        my $groupName = $json->{'groupName'};
        print "linkID: $linkID\n";
        print "Group Name Received: $groupName\n";
        my $sth_group_id = $dbh->prepare(
            'SELECT groupID FROM groups WHERE group_name = ?'
        );
        $sth_group_id->execute($groupName);
        my ($groupID) = $sth_group_id->fetchrow_array();

        unless ($groupID) {
            return {success => 0, error   => "Group not found for groupName: $groupName",};
        }

        # Insert linkID and groupID into link_group table
        my $sth_link_group = $dbh->prepare(
            'INSERT INTO link_group (linkID, groupID) VALUES (?, ?)'
        );
        my $success_link_group = $sth_link_group->execute($linkID, $groupID);

        unless ($success_link_group) {
            return {
                success => 0,
                error   => "Failed to insert into link_group: " . $dbh->errstr,
            };
        }

        # Fetch all userIDs associated with the groupID
        my $sth_participants = $dbh->prepare(
            'SELECT userID FROM user_group WHERE groupID = ?'
        );
        $sth_participants->execute($data->{'groupID'});

        my @userIDs;
        while (my ($userID) = $sth_participants->fetchrow_array()) {
            push @userIDs, $userID;
        }

        # Step 4: Insert linkID and userID into user_link table
        my $sth_user_link = $dbh->prepare(
            'INSERT INTO user_link (userID, linkID) VALUES (?, ?)'
        );

        foreach my $userID (@userIDs) {
            $sth_user_link->execute($userID, $linkID);
        }

        return {
            success   => 1,
            operation => "CREATE",
            inserted  => {
                linkID    => $linkID,
                groupID   => $groupID,
                userIDs   => \@userIDs,
                groupName => $groupName,
            },
        };
    }

    return {
        success => 0, error   => "Unsupported table: $table",
    };
}

sub readJSON {
    my $dbh = shift(@_);
    my $json = shift(@_);

    my $table = $json->{'table'};
    my $userEmail = $json->{'userEmail'};
    my $groupID = $json->{'groupID'};
    if ($table eq "link") {
        # my $sth = $dbh->prepare(
        #     'SELECT * FROM link 
        #      JOIN user_link ON link.linkID = user_link.linkID
        #      WHERE user_link.userID = ?'
        # );
        # $sth->execute($userEmail) or die 'execution failed: ' . $dbh->errstr();
        # return $sth->fetchall_arrayref({});

        my $sth = $dbh->prepare(
            'SELECT link.*, 
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM user_link 
                            WHERE user_link.linkID = link.linkID 
                            AND user_link.userID != ?
                        ) 
                        THEN 1 ELSE 0 END AS is_shared
             FROM link 
             LEFT JOIN user_link ON link.linkID = user_link.linkID
             WHERE user_link.userID = ? OR user_link.userID IS NULL'
        );
        $sth->execute($userEmail, $userEmail) or die 'execution failed: ' . $dbh->errstr();
        return $sth->fetchall_arrayref({});

    }elsif ($table eq "link_group") {
        my $sth = $dbh->prepare(
            'SELECT * FROM link 
             JOIN link_group ON link.linkID = link_group.linkID
             WHERE link_group.groupID = ?'
        );
        $sth->execute($groupID) or die 'execution failed: ' . $dbh->errstr();
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
    }elsif ($table eq "user_group") {
        my $sth = $dbh->prepare('SELECT userID FROM user_group WHERE groupID = ?');
        $sth->execute($groupID) or die 'execution failed: ' . $dbh->errstr();
        # Collect all user IDs into an array of strings
        my @user_ids;
        while (my $row = $sth->fetchrow_hashref) {
            push @user_ids, $row->{'userID'};
        }
        # Return the array of user IDs as a JSON array
        return { userIDs => \@user_ids };

    }elsif ($table eq "groups") {
        my $sth = $dbh->prepare('SELECT group_name FROM groups WHERE owner = ?');
        $sth->execute($userEmail) or die 'execution failed: ' . $dbh->errstr();
        # Collect all user IDs into an array of strings
        my @group_name;
        while (my $row = $sth->fetchrow_hashref) {
            push @group_name, $row->{'group_name'};
        }
        # Return the array of user IDs as a JSON array
        return { groupNames => \@group_name };

    } elsif ($table eq "users") {
        my $sth = $dbh->prepare('SELECT * FROM users') or die 'prepare statement failed: ' . $dbh->errstr();
        $sth->execute() or die 'execution failed: ' . $dbh->errstr();
        return $sth->fetchall_arrayref({});
    }elsif ($table eq "checkCategory") {
        # my $sth = $dbh->prepare(
        #     'SELECT DISTINCT l.category 
        #      FROM link l
        #      JOIN user_link ul ON l.linkID = ul.linkID
        #      WHERE ul.userID = ?'
        # );
        # $sth->execute($userEmail) or die 'execution failed: ' . $dbh->errstr();
        
        # # Fetch unique categories and return them
        # my @categories;
        # while (my $row = $sth->fetchrow_hashref) {
        #     push @categories, $row->{'category'};
        # }

        # return \@categories;
         my $sth = $dbh->prepare(
            'SELECT l.category, 
                    SUM(CASE WHEN l.owner = ? THEN 1 ELSE 0 END) AS my_links,
                    SUM(CASE WHEN l.owner != ? THEN 1 ELSE 0 END) AS shared_links
             FROM link l
             JOIN user_link ul ON l.linkID = ul.linkID
             WHERE ul.userID = ?
             GROUP BY l.category'
        );
        $sth->execute($userEmail, $userEmail, $userEmail) or die 'execution failed: ' . $dbh->errstr();
        
        # Fetch categories and counts
        my @categories;
        while (my $row = $sth->fetchrow_hashref) {
            push @categories, {
                category => $row->{'category'},
                my_links => $row->{'my_links'},
                shared_links => $row->{'shared_links'}
            };
        }

        return \@categories;
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
            'UPDATE users SET username=?, email=?, full_name=?, role=? WHERE userID=?'
        ) or die 'prepare statement failed: ' . $dbh->errstr();

        $sth->execute($data->{'username'}, $data->{'email'}, 
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
    my $groupID = $json->{'groupID'};

    if ($table eq "link") {
        # Validate the user has permission to delete the link
        my $sth_check = $dbh->prepare('SELECT COUNT(*) FROM user_link WHERE linkID=? AND userID=?');
        $sth_check->execute($id, $userID);
        my ($count) = $sth_check->fetchrow_array();

        unless ($count) {
            return { success => 0, error => "Permission denied or record not found" };
        }

        # Delete from user_link
        my $sth_user_link = $dbh->prepare('DELETE FROM user_link WHERE linkID=? AND userID=?');
        $sth_user_link->execute($id,$userID) or die 'execution failed: ' . $dbh->errstr();

        return { success => 1, operation => "DELETE", id => $id,userID => 'userID'};
    }elsif($table eq "link_group") {
        # New logic for "link_group" table
        my $sth_check = $dbh->prepare('SELECT COUNT(*) FROM link_group WHERE linkID=? AND groupID=?');
        $sth_check->execute($id, $groupID);
        my ($count) = $sth_check->fetchrow_array();

        unless ($count) {
            return { success => 0, error => "Record not found" };
        }

        my $sth_delete = $dbh->prepare('DELETE FROM link_group WHERE linkID=? AND groupID=?');
        $sth_delete->execute($id, $groupID) or die 'execution failed: ' . $dbh->errstr();

        return { success => 1, operation => "DELETE", id => $id, groupID => $groupID };
    }elsif($table eq "user_group") {
        my $email = $json->{'userID'};
        my $sth_check = $dbh->prepare('SELECT COUNT(*) FROM user_group WHERE userID=? AND groupID=?');
        $sth_check->execute($email, $groupID);
        my ($count) = $sth_check->fetchrow_array();

        unless ($count) {
            return { success => 0, error => "Record not found" };
        }
        unless ($email && $groupID) {
        return { success => 0, error => "Missing required fields: email or groupID" };
        }
        my $sth_delete = $dbh->prepare('DELETE FROM user_group WHERE userID=? AND groupID=?');
        $sth_delete->execute($email,$groupID) or die 'execution failed: ' . $dbh->errstr();

        return { success => 1, operation => "DELETE", email => $email, groupID => $groupID };
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

    # Check if the username exists in the database
    my $sth_user = $dbh->prepare('SELECT * FROM users WHERE username = ?');
    $sth_user->execute($username) or die "Execution failed: " . $dbh->errstr;
    my $user_result = $sth_user->fetchall_arrayref({});

    if (@$user_result) {
        # Username exists, check if the password matches
        my $sth_password = $dbh->prepare('SELECT * FROM users WHERE username = ? AND password = ?');
        $sth_password->execute($username, $password) or die "Execution failed: " . $dbh->errstr;
        my $password_result = $sth_password->fetchall_arrayref({});

        if (@$password_result) {
            # Username and password match
            return {
                success    => 1,
                userExists => 1,
                passwordCorrect => 1,
                userData   => $password_result->[0],
            };
        } else {
            # Username exists but password is incorrect
            return {
                success    => 1,
                userExists => 1,
                passwordCorrect => 0,
            };
        }
    } else {
        # Username does not exist
        return {
            success    => 1,
            userExists => 0,
        };
    }
}


sub readSharedInfo {
    my $dbh = shift(@_);
    my $linkID = shift(@_);
    my $type = shift(@_);
    
    my $sth;
    my $result;
    
    if ($type eq 'user') {
        $sth = $dbh->prepare(
            'SELECT ul.userID
             FROM user_link ul
             JOIN link l ON ul.linkID = l.linkID
             WHERE ul.linkID = ? AND ul.userID != l.owner'
        );
        $sth->execute($linkID) or die 'execution failed: ' . $dbh->errstr();
        $result = $sth->fetchall_arrayref({});
    } elsif ($type eq 'group') {
        $sth = $dbh->prepare(
            'SELECT g.group_name
             FROM link_group lg
             JOIN groups g ON lg.groupID = g.groupID
             WHERE lg.linkID = ?'
        );
        $sth->execute($linkID) or die 'execution failed: ' . $dbh->errstr();
        $result = $sth->fetchall_arrayref({});
    }

    return $result // [];
}

1;
