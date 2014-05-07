#!/bin/bash

COUNT=100

while [ $COUNT -gt 0 ]; do
	echo $COUNT
	let COUNT=COUNT-1

	git reset --hard HEAD~$COUNT
	willow cr
	git ff upstream/dev
done
