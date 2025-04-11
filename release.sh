#!/usr/bin/env bash

BUILD_DATE_FORMAT=`date +"%Y-%m-%d %H:%M"`
BUILD_DATE=`date +"%Y_%m_%d_%H_%M"`

function update_version() {
	CURRENT_VERSION=$(jq -r '.version' package.json)
	if [[ $CURRENT_VERSION == *"dev"* ]]; then
		echo "Version is dev, skip update version"
		return
	fi

	IFS='.' read -r major minor patch <<<"$CURRENT_VERSION"
	echo "Current version: $CURRENT_VERSION"
	new_patch=$((patch + 1))
	NEW_VERSION="$major.$minor.$new_patch"

	GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
	if [[ $GIT_BRANCH == "master" ]]; then
		TAG_NAME="v$NEW_VERSION"
	else
		TAG_NAME="$NEW_VERSION-dev.$BUILD_DATE"
	fi

	jq --arg version "$NEW_VERSION" '.version = $version' package.json > package.tmp && \
	mv package.tmp package.json && \
	git add package.json && \
	git commit -m "Update version to $NEW_VERSION" && \
	git tag -a $TAG_NAME -m "Tag version $TAG_NAME" && \
	git push origin $TAG_NAME && \
	git push origin master

    GIT_COMMIT=$(git rev-parse --short HEAD)
	if [ -d "./public" ]; then
		echo $(jq -n --arg branch "$GIT_BRANCH" --arg version "$NEW_VERSION" --arg commit "$GIT_COMMIT" --arg time "$BUILD_DATE_FORMAT" \
		'{branch: $branch, version: $version, commit: $commit, time: $time}') > ./public/version.json
		cat ./public/version.json
		echo "Update version to $NEW_VERSION"
	fi
}

function deploy(){
	update_version
}

$@
