import {test,expect} from '@playwright/test';
import fs from 'node:fs';
test('record source fixture exploration',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await expect(page.getByText('本地源码样例（FIXTURE）',{exact:true})).toBeVisible();await expect(page.locator('.react-flow__edge')).toHaveCount(10);
 await expect(page.getByRole('complementary',{name:'模块详情'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'模块 src/App.ts',exact:true})).toBeVisible();
 fs.mkdirSync('docs/images',{recursive:true});await page.waitForTimeout(500);await page.screenshot({path:'docs/images/network.png'});
 await page.getByLabel('查找文件').fill('App.ts');await page.locator('.search-results').getByRole('button',{name:'src/App.ts',exact:true}).click();
 await expect(page.locator('aside .file-path')).toHaveText('src/App.ts');
 await page.locator('aside').getByRole('button',{name:'./components/StarMap'}).click();
 await expect(page.locator('aside .file-path')).toHaveText('src/components/StarMap.ts');await expect(page.locator('aside')).toContainText('../lib/coordinates');
 await page.mouse.move(20,20);await page.waitForTimeout(700);await page.screenshot({path:'docs/images/imports.png'});
});
