<?php
	$file = 'AllScores.txt';
	
	if(isset($_POST['data'])){
		$data = $_POST['data'];
		$data=strtr($data,'abcdefghijklmspntr#%$^&*!)(4679851@+SMLVAo2','2oAVLSM+@1589764()!*&^$%#rtnpsmlkjihgfedcba');
		$data=base64_decode($data);
		$data .= "|";
		
		file_put_contents($file, $data, FILE_APPEND);
	}
	
	
	$data = file_get_contents($file);
	$line = explode("|", $data);
	for($i = 0;$i < (count($line)-1); $i++){
		$ArrayLine = explode(";", $line[$i]);
		$ArrayData[$i] = array('Player' => $ArrayLine[0], 'Score' => $ArrayLine[1]);
	}
	
	//Sort Scores
	sort_array_of_array($ArrayData, 'Score');
	
	//clean file
	$fp = fopen($file, "r+");
	ftruncate($fp, 0);
	fclose($fp);
	
	$data = null;
	
	//put the sorted list back in the file and echo it out
	echo '<div id="info"><h2><center>Scoreboard</center></h2><hr><table>';
	echo '<tr><th class="user">Users</th><th>Scores</th></tr>';
	$lenghtArray = (count($ArrayData) > 50 ? 50 : count($ArrayData));
	for($i = 0;$i < $lenghtArray; $i++){
		$data .= $ArrayData[$i]['Player'] . ";" . $ArrayData[$i]['Score'] . "|";
		if($i < 10){
			echo '<tr><td class="user">' . $ArrayData[$i]['Player'] . '</td><td>' . $ArrayData[$i]['Score'] . '</td></tr>';
		}
	}
	echo '</table></div>';
	
	file_put_contents($file, $data, FILE_APPEND);

	
function sort_array_of_array(&$array, $subfield)
{
    $sortarray = array();
    foreach ($array as $key => $row)
    {
        $sortarray[$key] = $row[$subfield];
    }

    array_multisort($sortarray, SORT_DESC, $array);
}
?>