<?php

namespace App\Imports\Sheets;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\HasReferencesToOtherSheets;
use Maatwebsite\Excel\Concerns\ToCollection;

class JournalRankingSheetImport implements HasReferencesToOtherSheets, ToCollection
{
    public function collection(Collection $collection)
    {
        //
    }
}
