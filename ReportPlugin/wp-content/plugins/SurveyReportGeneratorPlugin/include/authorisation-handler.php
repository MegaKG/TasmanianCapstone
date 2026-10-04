<?php

/* Check if user is allowed to access page:

    */
    function DashboardIsAuthorised(){
        if (is_user_logged_in()){
            if (current_user_can('author')) {
                return true;
            }
        }    
        return false;
    
    }

    function ReportAdminIsAuthorised(){
        if (is_user_logged_in()){
            if (current_user_can('administrator')) {
                return true;
            }
        }
        return false;
    }
?>