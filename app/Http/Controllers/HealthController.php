<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            $database = 'connected';
            $status = Response::HTTP_OK;
        } catch (Throwable) {
            $database = 'unavailable';
            $status = Response::HTTP_SERVICE_UNAVAILABLE;
        }

        $commitFile = base_path('DEPLOYED_COMMIT');
        $commitSha = is_file($commitFile)
            ? trim((string) file_get_contents($commitFile))
            : 'development';

        return response()->json([
            'status' => $status === Response::HTTP_OK ? 'ok' : 'degraded',
            'application' => config('app.name'),
            'environment' => app()->environment(),
            'database' => $database,
            'commit_sha' => $commitSha,
        ], $status);
    }
}
