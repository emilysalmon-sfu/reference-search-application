<?php

namespace App\Http\Controllers;

use App\Exports\ArticlesExport;
use App\Http\Requests\FileExportRequest;
use App\Http\Requests\FileUploadRequest;
use App\Imports\ArticlesImport;
use App\Imports\Sheets\ArticleSheetImport;
use App\Models\Article;
use App\Models\ArticleExportInfo;
use App\Models\ArticleImportUpload;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class FileController extends Controller
{
    public function index()
    {
        return Inertia::render('Upload/upload');
    }

    public function fileUpload(FileUploadRequest $request)
    {
        try {
            $articleSheetImport = new ArticleSheetImport;
            $file = $request->file('file');

            $import = new ArticlesImport($articleSheetImport);

            Excel::import(
                $import,
                $file
            );

            ArticleImportUpload::create([
                'date' => now('America/Vancouver')->toDateString(),
                'articlesCreated' => $import->getArticlesImportedCount(),
            ]);

            Log::info('File uploaded successfully', [
                'date' => now('America/Vancouver')->toDateString(),
                'file' => $file->getClientOriginalName(),
                'articlesCreated' => $import->getArticlesImportedCount(),
                'user' => auth()->user() ? auth()->user()->name . ' ' . auth()->user()->email : 'guest',
            ]);

            return redirect()->back()->with('success', 'File uploaded successfully');
        } catch (\Throwable $e) {
            Log::error('File upload/import failed', [
                'date' => now('America/Vancouver')->toDateString(),
                'message' => $e->getMessage(),
                'file' => $file->getClientOriginalName(),
                'line' => $e->getLine(),
            ]);

            return redirect()->back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    public function fileExport(FileExportRequest $request)
    {
        try {
            $data = $request->validated();

            $query = Article::query();

            if ($author = $data['author'] ?? '') {
                $query->where('author', 'like', '%' . $author . '%');
            }

            if ($title = $data['title'] ?? '') {
                $query->where('title', 'like', '%' . $title . '%');
            }

            if ($journal = $data['journal'] ?? '') {
                $query->where('journal_name', 'like', '%' . $journal . '%');
            }

            if ($keywords = $data['keywords'] ?? '') {
                $query->where('keywords', 'like', '%' . $keywords . '%');
            }

            if ($abstract = $data['abstract'] ?? '') {
                $query->where('abstract', 'like', '%' . $abstract . '%');
            }

            if ($from = $data['year_from'] ?? '') {
                $query->where('year_published', '>=', $from);
            }

            if ($to = $data['year_to'] ?? '') {
                $query->where('year_published', '<=', $to);
            }

            if ($theme = $data['theme'] ?? '') {
                $query->where('theme', 'like', '%' . $theme . '%');
            }

            if ($sub_theme_1 = $data['sub_theme_1'] ?? '') {
                $query->where('sub_theme_1', 'like', '%' . $sub_theme_1 . '%');
            }

            if ($country = $data['country'] ?? '') {
                $query->where('country', 'like', '%' . $country . '%');
            }

            if ($type_of_study = $data['type_of_study'] ?? '') {
                $query->where('type_of_study', 'like', '%' . $type_of_study . '%');
            }

            if ($doi = $data['doi'] ?? '') {
                $query->where('doi', 'like', '%' . $doi . '%');
            }

            $articlesToDownload = $query->get();

            if ($articlesToDownload->isEmpty()) {
                return back()->with('error', 'No articles found for the selected filters.');
            }

            // Record the download count
            $today = now('America/Vancouver')->toDateString();
            $exportInfo = ArticleExportInfo::whereDate('date', $today)->first();
            
            if ($exportInfo) {
                $exportInfo->increment('count');
            } else {
                ArticleExportInfo::create([
                    'date' => $today,
                    'count' => 1,
                ]);
            }

            $dateSuffix = now('America/Vancouver')->format('Y-m-d_H-i-s');

            // Return a CSV download (you can also use xlsx)
            return Excel::download(
                new ArticlesExport($articlesToDownload),
                'articles_' . $dateSuffix . '.xlsx',
                \Maatwebsite\Excel\Excel::XLSX
            );
        } catch (\Throwable $e) {
            Log::error('File export failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return back()->with('error', 'Export failed: ' . $e->getMessage());
        }
    }
}
