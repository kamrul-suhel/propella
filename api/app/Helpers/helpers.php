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
     * @param string $path
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
        $publicPath = env('IMAGE_BASE_URL') . DIRECTORY_SEPARATOR . $imageFolder . DIRECTORY_SEPARATOR . date('Y') . DIRECTORY_SEPARATOR . date('n');

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
        if (file_exists($absolutePath) && is_file($absolutePath)) {
            unlink($absolutePath);
            return true;
        }
        return false;
    }
}

if (!function_exists('getCsvString')) {
    /**
     * @param $array
     * @return string
     */
    function getCsvString($array)
    {
        $data = '';
        $header = array_keys($array[0]);
        $cleanHeader = [];
        foreach ($header as $name) {
            $cleanHeader[] = ucwords(str_replace('_', ' ', $name));
        }
        $header = implode(',', $cleanHeader);

        foreach ($array as $key => $value) {
            if (is_array($value)) {
                foreach ($value as $k => $v) {
                    if ($k == 'request_header') {
                        $data .= '"' . str_replace(',', ';', $v) . '",';
                    } else {
                        $data .= '"' . $v . '",';
                    }
                }
                $data .= "\n";
            }
        }

        $data = substr($data, 0, -1);
        return $header . "\n" . $data;
    }
}

if (!function_exists('getPosition')) {
    function getPosition($position)
    {
        if ($position > 100) {
            return 100;
        }

        if ($position < 0) {
            return 0;
        }

        return $position;
    }
}