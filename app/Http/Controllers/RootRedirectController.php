<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RootRedirectController extends Controller
{
    /**
     * Get the default route name for a given user based on their role.
     *
     * @param  User  $user
     * @return \Symfony\Component\HttpFoundation\Response

     */


    public function getRedirectRoute() : Response
    {
        if(!Auth::check())
            return redirect()->route('login');

        //return redirect()->route('register');

        switch(Auth::user()->role){ // For Route . ->name()
             case "admin":
                return redirect()->route('admin.dashboard');
            default:
                return redirect()->intended('/'); // Default redirect
        }
    }
}
