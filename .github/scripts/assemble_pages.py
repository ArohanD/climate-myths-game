"""Publish only static app files; never execute or import code from a PR."""
import base64
import hashlib
import json
import os
from pathlib import Path
import shutil
import re
import urllib.request

FILES = ('index.html', 'styles.css', 'app.js', 'deck.js', 'initial-data.js', 'favicon.svg')
REPOSITORY = os.environ['REPOSITORY']
TOKEN = os.environ['GH_TOKEN']
OUTPUT = Path('_site')


def version_assets(destination):
    """Content-derived URLs prevent stale defaults and mixed cached releases."""
    def version(name):
        digest = hashlib.sha256((destination / name).read_bytes()).hexdigest()[:16]
        return f'{name}?v={digest}'
    app = destination / 'app.js'
    script = app.read_text(encoding='utf-8')
    for name in ('initial-data.js', 'deck.js'):
        script = re.sub(r"(?<=['\"])\./" + re.escape(name) + r"(?:\?[^'\"]*)?(?=['\"])", './' + version(name), script)
    app.write_text(script, encoding='utf-8')
    index = destination / 'index.html'
    html = index.read_text(encoding='utf-8')
    for name in ('app.js', 'styles.css'):
        html = re.sub(r"(?<=['\"])" + re.escape(name) + r"(?:\?[^'\"]*)?(?=['\"])", version(name), html)
    index.write_text(html, encoding='utf-8')


def api(path):
    request = urllib.request.Request(
        f'https://api.github.com/repos/{REPOSITORY}/{path}',
        headers={'Authorization': f'Bearer {TOKEN}', 'Accept': 'application/vnd.github+json',
                 'X-GitHub-Api-Version': '2022-11-28'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def main():
    OUTPUT.mkdir(exist_ok=False)
    for name in FILES:
        shutil.copyfile(name, OUTPUT / name)
    version_assets(OUTPUT)
    (OUTPUT / '.nojekyll').touch()
    base_url = os.environ['PAGES_URL'].rstrip('/')
    summary = [f'Live site: {base_url}/', '', '## PR previews', '',
               'Previews are published for open PRs from this repository. Fork PRs are not published.', '']
    page = 1
    while True:
        pulls = api(f'pulls?state=open&per_page=100&page={page}')
        if not pulls:
            break
        for pull in pulls:
            if (pull['head'].get('repo') or {}).get('full_name') != REPOSITORY:
                continue
            number = int(pull['number'])
            sha = pull['head']['sha']
            tree = {entry['path']: entry for entry in api(f'git/trees/{sha}')['tree']}
            files = {}
            for name in FILES:
                entry = tree.get(name)
                if not entry or entry['type'] != 'blob' or entry['mode'] not in ('100644', '100755'):
                    break
                if entry.get('size', 0) > 1_000_000:
                    break
                blob = api(f"git/blobs/{entry['sha']}")
                if blob.get('encoding') != 'base64' or blob['size'] > 1_000_000:
                    break
                files[name] = base64.b64decode(blob['content'])
            if len(files) != len(FILES):
                summary.append(f'- PR #{number}: skipped (missing or invalid static app files).')
                continue
            destination = OUTPUT / 'previews' / f'pr-{number}'
            destination.mkdir(parents=True)
            for name, content in files.items():
                (destination / name).write_bytes(content)
            version_assets(destination)
            url = f'{base_url}/previews/pr-{number}/'
            summary.append(f'- [PR #{number}]({url}) · `{sha[:7]}`')
        page += 1
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as output:
        output.write('\n'.join(summary) + '\n')


if __name__ == '__main__':
    main()
