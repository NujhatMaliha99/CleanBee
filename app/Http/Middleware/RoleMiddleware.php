<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        $hasRequiredRole = $user
            && in_array($user->role, $roles, true)
            && ($user->role !== 'volunteer' || $user->volunteer_enabled);
        $hasVolunteerMode = $user
            && in_array('volunteer', $roles, true)
            && $user->volunteer_enabled;

        if (!$hasRequiredRole && !$hasVolunteerMode) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission to access this resource.'
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
