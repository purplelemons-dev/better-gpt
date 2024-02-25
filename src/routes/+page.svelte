<script lang="ts">
	let textContent = '';
	let newValue = '';
	$: displayValue = newValue + textContent;
	let input = '';

	function generate() {
		console.log('input', input);
		const stream = new EventSource('/api/generate?prompt=' + encodeURIComponent(input));
		stream.onmessage = (event) => {
			if (event.data === '<|close|>') {
				stream.close();
				const stream2 = new EventSource(
					'/api/generate?prompt=' +
						encodeURIComponent(`Refine the logic and phrasing of the text:\n${textContent}`)
				);
				stream2.onmessage = (event) => {
					if (event.data === '<|close|>') {
						return stream2.close();
					}
					newValue += event.data;
					textContent = textContent.slice(event.data.length);
				};
                return;
			}
			textContent += event.data;
		};
	}
</script>

<input bind:value={input} />
<button on:click={generate}>Generate</button>

<br />
<br />

<code contenteditable="true" bind:textContent={displayValue} style="height: 8em; width: 24em;" wrap="soft"></code>
