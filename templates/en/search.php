<div class="section">
<h1>Search results</h1>
<?php if (empty($generated)) { ?>
	<p>No search results found</p>
<?php } else { ?>
	<ol>
	<?php foreach ($generated as $result) { ?>
		<li><a href="<?= $result["url"] ?>"><?= $result["title"] ?></a><br><?= $result["excerpt"] ?></li>
	<?php } ?>
	</ol>
<?php } ?>
</div>

