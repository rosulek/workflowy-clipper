all:
	mkdir -p build
	rm build/submit.zip
	zip -j build/submit.zip src/*
	chromium-browser --pack-extension=src --pack-extension-key=key.pem
	mv src.crx build/workflowy-clipper.crx
