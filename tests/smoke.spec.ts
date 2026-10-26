import {test,expect} from '@playwright/test';
test('sample resolves real source imports and module navigation',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'加载样例'}).click();await expect(page.getByText('本地源码样例（FIXTURE）',{exact:true})).toBeVisible();await expect(page.getByTestId('file-count')).toHaveText('9');await expect(page.getByTestId('edge-count')).toHaveText('10');await expect(page.locator('.react-flow__edge')).toHaveCount(10);await page.getByRole('button',{name:'模块 src/App.ts',exact:true}).hover();await page.getByRole('button',{name:'模块 src/App.ts',exact:true}).click();await expect(page.locator('aside .file-path')).toHaveText('src/App.ts');await expect(page.locator('aside')).toContainText('./components/StarMap');await page.locator('aside').getByRole('button',{name:'./components/StarMap'}).click();await expect(page.locator('aside .file-path')).toHaveText('src/components/StarMap.ts');});
test('invalid GitHub URL is rejected through the API',async({page})=>{await page.goto('/');await page.getByLabel('GitHub 公开仓库地址').fill('https://example.com/private');const response=page.waitForResponse(r=>r.url().endsWith('/api/map'));await page.getByRole('button',{name:'生成星图'}).click();expect((await response).status()).toBe(400);await expect(page.getByRole('alert')).toContainText('请使用 https://github.com/owner/repository');});
test('中文首次引导与小屏键盘操作',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
 await expect(page.getByRole('navigation',{name:'首次使用三步引导'})).toContainText('无需 Key');
 await page.getByRole('button',{name:'加载样例',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByTestId('edge-count')).toHaveText('10');
 const node=page.getByRole('button',{name:'模块 src/App.ts',exact:true});await node.focus();await page.keyboard.press('Enter');
 await expect(page.locator('aside .file-path')).toHaveText('src/App.ts');
 await expect(page.getByRole('button',{name:'放大',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'artifacts/repo-galaxy-mobile-zh.png',fullPage:true});
});
test('中文网络失败提示可恢复到明确标注的本地样例',async({page})=>{
 await page.route('**/api/map',route=>route.abort());await page.goto('/');await page.getByRole('button',{name:'生成星图'}).click();
 await expect(page.getByRole('alert')).toContainText('无法连接本地 API');
 await page.getByRole('button',{name:'改用本地样例'}).click();
 await expect(page.getByText('本地源码样例（FIXTURE）',{exact:true})).toBeVisible();await expect(page.getByTestId('file-count')).toHaveText('9');
});
