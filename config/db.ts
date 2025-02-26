import serverlessMysql from 'serverless-mysql';

const db = serverlessMysql({
	config: {
		host: process.env.MYSQL_HOST,
		port: +!process.env.MYSQL_PORT,
		database: process.env.MYSQL_DATABASE,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD
	},
	library: require('mysql2')
});
export default async function excuteQuery({ query, values }: { query: string, values: any[] }) {
	try {
		const results = await db.query(query, values);
		await db.end();
		return results;
	} catch (error) {
		return { error };
	}
}