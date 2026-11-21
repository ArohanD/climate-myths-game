import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import base64


class PagesAssemblyTest(unittest.TestCase):
    def test_default_changes_invalidate_the_import_and_entrypoint(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {'REPOSITORY':'owner/repo', 'GH_TOKEN':'test'}):
            spec = importlib.util.spec_from_file_location('pages', Path(__file__).with_name('assemble_pages.py'))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            root = Path(directory)
            (root / 'initial-data.js').write_text('export const initialDeck = [];')
            (root / 'deck.js').write_text('export const validateDeck = x => x;')
            (root / 'styles.css').write_text('body {color:black}')
            (root / 'app.js').write_text("import { initialDeck } from './initial-data.js'; import { validateDeck } from './deck.js?v=old';")
            (root / 'index.html').write_text('<link href="styles.css?v=old"><script src="app.js?v=old"></script>')
            module.version_assets(root)
            first_app = (root / 'app.js').read_text()
            first_html = (root / 'index.html').read_text()
            module.version_assets(root)
            self.assertEqual((root / 'index.html').read_text(), first_html)
            (root / 'initial-data.js').write_text('export const initialDeck = [{id:1}];')
            module.version_assets(root)
            self.assertNotEqual((root / 'app.js').read_text(), first_app)
            self.assertNotEqual((root / 'index.html').read_text(), first_html)
            self.assertNotIn('?v=old', (root / 'app.js').read_text())

    def test_static_allowlist_fork_skip_and_no_execution(self):
        script = Path(__file__).with_name('assemble_pages.py')
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {
            'REPOSITORY': 'owner/repo', 'GH_TOKEN': 'test',
            'PAGES_URL': 'https://owner.github.io/repo',
            'GITHUB_STEP_SUMMARY': str(Path(directory) / 'summary.md')
        }):
            spec = importlib.util.spec_from_file_location('pages', script)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            old = Path.cwd()
            os.chdir(directory)
            try:
                for name in module.FILES:
                    Path(name).write_text('main version')
                def api(path):
                    if path.startswith('pulls?'):
                        return [] if 'page=2' in path else [
                            {'number': 3, 'head': {'sha': 'abc', 'repo': {'full_name': 'owner/repo'}}},
                            {'number': 4, 'head': {'sha': 'def', 'repo': {'full_name': 'fork/repo'}}}]
                    if path == 'git/trees/abc':
                        return {'tree': [{'path': n, 'type': 'blob', 'mode': '100644', 'sha': n, 'size': 20} for n in module.FILES]}
                    if path.startswith('git/blobs/'):
                        return {'encoding': 'base64', 'size': 20, 'content': base64.b64encode(b'throw new Error("never execute PR code")').decode()}
                    self.fail(path)
                with patch.object(module, 'api', api):
                    module.main()
                self.assertEqual(Path('_site/index.html').read_text(), 'main version')
                self.assertTrue(Path('_site/previews/pr-3/app.js').exists())
                self.assertFalse(Path('_site/previews/pr-4').exists())
                self.assertEqual(set(p.name for p in Path('_site/previews/pr-3').iterdir()), set(module.FILES))
                self.assertIn('/previews/pr-3/', Path('summary.md').read_text())
            finally:
                os.chdir(old)


if __name__ == '__main__':
    unittest.main()
