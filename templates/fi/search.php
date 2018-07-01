<div class="section">
<h1>Haku tulokset</h1>
<?php if (empty($generated)) { ?>
	<p>Yhtään tulosta ei löydetty</p>
<?php } else { ?>
	<ol>
	<?php foreach ($generated as $result) { ?>
		<li><a href="<?= $result["url"] ?>"><?= $result["title"] ?></a><br><?= $result["excerpt"] ?></li>
	<?php } ?>
	</ol>
<?php } ?>
</div>
