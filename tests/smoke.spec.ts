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
 await page.getByRole('button',{name:'关闭详情'}).click();await expect(node).toBeFocused();await page.keyboard.press('Space');await expect(page.locator('aside .file-path')).toHaveText('src/App.ts');
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
test('桌面全幅图谱、文件搜索及关闭详情',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await expect(page.getByTestId('file-count')).toHaveText('9');
 await expect(page.getByRole('complementary')).toHaveCount(0);
 await page.getByLabel('查找文件').fill('StarMap');await page.locator('.search-results').getByRole('button',{name:'src/components/StarMap.ts',exact:true}).click();
 await expect(page.locator('aside .file-path')).toHaveText('src/components/StarMap.ts');
 await page.getByRole('button',{name:'关闭详情'}).click();await expect(page.getByRole('complementary')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'模块 src/components/StarMap.ts',exact:true})).toBeFocused();
 expect(await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}))).toEqual({width:1440,height:900});
 await page.getByLabel('查找文件').fill('not-a-real-file');await expect(page.getByText('没有匹配的文件')).toBeVisible();
});
test('读取状态与无源码空态',async({page})=>{
 await page.goto('/');await expect(page.getByTestId('file-count')).toHaveText('9');
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/map',async route=>{await gate;await route.fulfill({json:{modules:[],edges:[],name:'empty/repo',source:'测试空源码',branch:'main',notice:'测试空仓库响应',truncated:false}});});
 await page.getByRole('button',{name:'生成星图'}).click();await expect(page.getByRole('status')).toContainText('正在读取文件');await expect(page.getByRole('button',{name:'读取中…'})).toBeDisabled();release();
 await expect(page.getByRole('status')).toContainText('未找到可读取的 TS/JS 文件');await expect(page.getByTestId('file-count')).toHaveText('0');
 await page.getByRole('button',{name:'加载样例'}).click();await expect(page.getByTestId('file-count')).toHaveText('9');
});
