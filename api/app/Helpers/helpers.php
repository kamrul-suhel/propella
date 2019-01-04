<?php
/**
 * Created by PhpStorm.
 * User: Kamrul ahmed
 * Date: 04/01/2019
 * Time: 16:36
 */

use Illuminate\Http\UploadedFile;

if (!function_exists('public_path')) {
    /**
     * Get the path to the public folder.
     *
     * @param  string $path
     * @return string
     */
    function public_path($path = '')
    {
        return env('PUBLIC_PATH', base_path('public')) . ($path ? '/' . $path : $path);
    }
}

if (!function_exists('propellaUploadImage')) {
    /**
     * @param UploadedFile $file
     * @param $imageFolder
     * @param null $existingImage
     * @param bool $update
     * @return string
     */
    function propellaUploadImage(UploadedFile $file, $imageFolder, $existingImage = null, $update = false)
    {
        // If updating existing record then first need to remove existing file.
        if ($update) {
            $absolutePath = public_path(str_replace(env('APP_URL') . DIRECTORY_SEPARATOR, '', $existingImage));
            if (file_exists($absolutePath)) {
                unlink($absolutePath);
            }
        }

        // For database record.
        $publicPath = env('IMAGE_BASE_URL') . DIRECTORY_SEPARATOR . $imageFolder . DIRECTORY_SEPARATOR . date('Y') . DIRECTORY_SEPARATOR .date('j') ;

        // Absolute path.
        $uploadPath = public_path($publicPath);

        // Filename to save into database.
        $fileName = time() . str_replace(' ', '_', $file->getClientOriginalName());

        // Move uploaded file into public storage..
        $file->move($uploadPath, $fileName);

        // Return public uploaded path.
        return env('APP_URL') . DIRECTORY_SEPARATOR . $publicPath . DIRECTORY_SEPARATOR . $fileName;
    }
}

if (!function_exists('propellaRemoveImage')) {
    /**
     * @param $imageUrl
     * @return bool
     */
    function propellaRemoveImage($imageUrl)
    {
        $absolutePath = public_path(str_replace(env('APP_URL') . DIRECTORY_SEPARATOR, '', $imageUrl));
        if (file_exists($absolutePath)) {
            unlink($absolutePath);
            return true;
        }
        return false;
    }
}