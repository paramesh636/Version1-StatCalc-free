




function sum(x){
	let sum = 0;
	for(let i=0;i < x.length;i++){
		sum += parseFloat(x[i]);
	}
	return sum;
}

function mean(x){
	let s = sum(x);
	return Math.round((s/x.length)*100000)/100000;
}

function median(x){

	let med;
	let n = x.length;
	x.sort((a,b) => a - b);

	if (n%2 == 0){
		let i = Math.trunc(n/2);
		med = (x[i - 1] + x[i])/2;
	}else{
		let i = Math.floor(n/2);
		med = x[i];
	}

	return med;

}

function multiply(x,y){

	let result = [];
	for(let i = 0;i<x.length;i++){
		result.push(x[i]*y[i]);
	}

	return result;
}

function factorial(x){

	let ans = 1;
	while(x >= 1){

		ans = ans * x;
		x--;
	}
	return ans;
}

function central_tendency(x){

	let m = mean(x);
	let n = x.length;
	let mode;
	let result = [];
	result.push(m);

	let med = median(x);
	result.push(med);

    const freq = {};
    let maxFreq = 0;

    for (let i = 0; i < x.length; i++){
        const val = x[i];
        freq[val] = (freq[val] || 0) + 1;

        if (freq[val] > maxFreq) {
            maxFreq = freq[val];
        }
    }

    if (maxFreq === 1) {
        mode = "No Modes";
    }

    const modes = [];
    for (let key in freq) {
        if (freq[key] === maxFreq) {
            
            modes.push(isNaN(key) ? key : Number(key));
        }
    }

    if (modes.length === 1 || modes.length === 2 || modes.length === 3) {
        mode = modes;
    }else{
    	mode = "Multiple Modes";
    }

    result.push(mode);

    return result;

}


function variance(x){

	let mean_x = mean(x);
	let dev = [];
	for(let i = 0;i < x.length; i++){
		let s = Math.round(Math.pow(x[i] -  mean_x,2)*10000)/10000;
		dev.push(s);
	}
	let v = sum(dev)/x.length;
	return [Math.round(v*10000)/10000,dev];

}

function standard_dev(x){

	let values = variance(x);
	let var_x = values[0];
	let sd = Math.round(Math.sqrt(var_x)*10000)/10000;
	return sd
}


function correlation_coeff(x,y){
	let n = x.length;
	let sum_x = sum(x);
	let sum_y = sum(y);
	let x2 = multiply(x,x);
	let y2 = multiply(y,y);
	let xy = multiply(x,y);
	let sum_x2 = sum(x2);
	let sum_y2 = sum(y2);
	let sum_xy = sum(xy);

	let r = ((n * sum_xy) - (sum_x * sum_y))/Math.sqrt(((n*sum_x2)-(sum_x*sum_x))*((n*sum_y2)-(sum_y*sum_y)));
	
	r = Math.round(r*100000)/100000;

	return [r,sum_x,sum_y,sum_x2,sum_y2,sum_xy,n,x2,y2,xy]

}

function curve_fit_linear(xArray,yArray){

	let n = xArray.length;
	let sum_x = sum(xArray);
	let sum_y = sum(yArray);
	let x2 = multiply(xArray,xArray);
	let xy = multiply(xArray,yArray);
	let sum_x2 = sum(x2);
	let sum_xy = sum(xy);
	let eqn1 = [[n,sum_x],[sum_x,sum_x2]];
	let constants = [sum_y,sum_xy];
	let solution = math.lusolve(eqn1,constants);
	return [solution,n,sum_x,sum_y,sum_x2,sum_xy,x2,xy];
}

function log_regress(xArray,yArray,lr,epoch){

	let weight = 0;
	let bias = 0;
	let n = xArray.length;
	for(let j = 0;j < epoch;j++){ 
		for(let i = 0;i < n;i++){
			let z = weight * xArray[i] + bias;
			let pred = 1 / (1 + Math.exp(-z));
			let error = (1/n) * (yArray[i] - pred);
			let w_gradient = xArray[i] * error;
			weight += lr * w_gradient;
			bias += lr * error;
		}
	}

	return [weight,bias];
}

function curve_fit_quadratic(xArray,yArray){
	let n = xArray.length;
	let sum_x = sum(xArray);
	let sum_y = sum(yArray);
	let x2 = multiply(xArray,xArray);
	let x3 = multiply(x2,xArray);
	let x4 = multiply(x3,xArray);
	let xy = multiply(xArray,yArray);
	let x2y = multiply(x2,yArray);
	let sum_x2 = sum(x2);
	let sum_x3 = sum(x3);
	let sum_x4 = sum(x4);
	let sum_xy = sum(xy);
	let sum_x2y = sum(x2y);
	let eqn = [[sum_x2,sum_x,n],[sum_x3,sum_x2,sum_x],[sum_x4,sum_x3,sum_x2]];
	let constants = [sum_y,sum_xy,sum_x2y];
	let solution = math.lusolve(eqn,constants);
	return [solution,n,sum_x,sum_y,sum_x2,sum_x3,sum_x4,sum_xy,sum_x2y,x2,x3,x4,xy,x2y];
}

function quartile(x){

	let n = x.length;
	let q2 = median(x);
	let q1;
	let q3;
	let iqr;

	let i = (n + 1)/4;
	let j = (n +1)*(3/4);

	if(i%1 != 0 || j%1 != 0){
		
		let rem_i = i%1;
		let rem_j = j%1;
		let curr_i = (i - rem_i) - 1;
		let curr_j = (j - rem_j) - 1;
		
		q1 = x[curr_i] + (rem_i * (x[curr_i + 1] - x[curr_i]));
		q3 = x[curr_j] + (rem_j * (x[curr_j + 1] - x[curr_j]));
		iqr = q3 - q1;
		return [q1,q2,q3,iqr];

	}

	q1 = x[i - 1];
	q3 = x[j - 1];
	iqr = q3 - q1;
	return [q1,q2,q3,iqr];
}

function z_score(dataset,x){

	let mean_x = mean(dataset);
	let sd = standard_dev(dataset);
	let z = Math.round(((x - mean_x)/sd)*10000)/10000;
	return [z,mean_x,sd];
}

function normal_distribution(mean_x,sd){

	let result = [];
	let labels = [];
	for(let i = mean_x - 4*sd;i <= mean_x + 4*sd;i += 0.05){

		result.push(	
				(1/(sd * Math.sqrt(2 * Math.PI)))*(Math.exp(-(Math.pow((i - mean_x),2)/(2 * sd * sd))))
			);
		labels.push(i);
		
	}

	return {
		labels:labels,
		curve:result
	};

}

function binomial_dist(n,p,x){

	let ncx = (factorial(n))/(factorial(x)*factorial(n - x));

	return ncx*(Math.pow(p,x))*(Math.pow(1-p,n-x));
}

function collatz(x){

	let label = [];
	let result = [];
	let i = 1;
	while(x > 1){

		if(x%2 == 0){
			x /= 2;
		}else{
			x = 3*x + 1;
		}

		label.push(i);
		result.push(x);
		i++;
	}

	return [label,result];
}


function t_test_stat(xbar, mu0, s, n) {
    return (xbar - mu0) / (s / Math.sqrt(n));
}

function calculate_t_pvalue(t, df, tail){

    if(tail=="less"){
        return jStat.studentt.cdf(t,df);
    }

    if(tail=="more"){
        return 1-jStat.studentt.cdf(t,df);
    }

    if(tail=="between"){
        return 2*(1-jStat.studentt.cdf(Math.abs(t),df));
    }

}


function chi_square_gof(observed, expected) {
    let chi2 = 0;
    let chi_data = [];
    let totalObs = observed.reduce((a,b)=>a+b, 0);
    let totalExp = expected.reduce((a,b)=>a+b, 0);
    
    if (Math.abs(totalExp - 1) < 1e-8) {
    	expected = expected.map(e => e * totalObs);
	}
	else if (Math.abs(totalExp - 100) < 1e-8) {
	    expected = expected.map(e => e / 100 * totalObs);
	}
    
    for (let i = 0; i < observed.length; i++) {
        let val = Math.pow(observed[i] - expected[i], 2);
        let res = val/expected[i]
        chi2 += res;
        chi_data.push({observed:observed[i],expected:expected[i],square: val,value : res});
    }
    
    let df = observed.length - 1;
    let pvalue = 1 - jStat.chisquare.cdf(chi2, df);
    
    return { chi2: chi2, df: df, pvalue: pvalue, data:chi_data };
}

function two_sample_t_test(xbar1, xbar2, s1, s2, n1, n2) {
    const numerator = xbar1 - xbar2;
    const denom = Math.sqrt( (s1*s1 / n1) + (s2*s2 / n2) );
    const t = numerator / denom;
    
    const v1 = s1*s1 / n1;
    const v2 = s2*s2 / n2;
    const df = Math.pow(v1 + v2, 2) / ( (Math.pow(v1,2)/(n1-1)) + (Math.pow(v2,2)/(n2-1)) );
    
    return { t: t, df: df };
}

function mann_whitney_u(x1,x2){

	const n1 = x1.length;
	const n2 = x2.length;

	let new_array = [...x1.map(val => ({val,src:"x1"})),...x2.map(val => ({val,src:"x2"}))];
	new_array.sort((a,b)=> a.val - b.val);
	let ranks = [];
	for(let i = 1;i <= new_array.length;i++){
		ranks.push({val:new_array[i - 1].val,rank:i});
	}
	for(let i = 0;i < ranks.length; ){
		
		let j = i + 1;
		while(j < ranks.length && ranks[j].val == ranks[i].val){
			j++;
		}
		if(j - i > 1){
			const start = i + 1;
			const end = j;
			const avg = (start + end)/2;
			for(let k = i;k < j;k++){
				ranks[k].rank = avg;
			}
		}
		i = j;

	}
	const r1 = sum((ranks.filter((e,i) => new_array[i].src == "x1")).map(e => e.rank));
	const r2 = sum((ranks.filter((e,i) => new_array[i].src == "x2")).map(e => e.rank));
	const u1 = n1*n2 + ((n1 * (n1 + 1))/2) - r1;
	const u2 = n1*n2 + ((n2 * (n2 + 1))/2) - r2;
	let u = Math.min(u1,u2);
	const meanU = (n1 * n2) / 2;
    const sigmaU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
    const z = (u - meanU) / sigmaU;
    
    return [ranks,r1,r2,u1,u2,u,z];

}

function generateDataset(no_of_data,no_of_single_values,type){

	const length = Math.floor(Math.random() * 1000);
	let datas = [];
	if(type == "sequential"){ 
		for(let i = 0;i < no_of_data;i++){
			let data = [];
			for(let j = 0;j < length;j++){
				if(i == 0){
					data.push(j + 1);
				}else{
					data.push(Math.round((Math.random() * 200) * 100)/100);
				}
			}
			datas.push(data);
		}
	}else if(type == "random"){
		for(let i = 0;i < no_of_data;i++){
			let data = [];
			for(let j = 0;j < length;j++){
				data.push(Math.round((Math.random() * 200) * 100)/100);
			}
			datas.push(data);
		}

	}

	let values = [];
	for(let i = 0;i < no_of_single_values;i++){
		values.push(Math.random() * 100);
	}

	return [datas,values];
}

function multiple_linear_regression(X_matrix, Y_array) {
   
    const X = X_matrix.map(row => [1, ...row]);
    const Y = Y_array;

    const X_mat = math.matrix(X);
    const Y_mat = math.matrix(Y);
    const X_T = math.transpose(X_mat);
    const X_T_X = math.multiply(X_T, X_mat);
    
    let X_T_X_inv;
    try {
        X_T_X_inv = math.inv(X_T_X);
    } catch (error) {
        throw "Matrix is singular or ill-conditioned. Ensure features are independent and not perfectly correlated.";
    }
    
    const X_T_Y = math.multiply(X_T, Y_mat);
    const beta = math.multiply(X_T_X_inv, X_T_Y);

    const coefficients = beta.toArray().map(v => Array.isArray(v) ? v[0] : v); // Flattens if it's a 2D array
    const predictions = math.multiply(X_mat, beta).toArray().map(v => Array.isArray(v) ? v[0] : v);

    // Calculate R-squared for model evaluation
    const y_mean = math.mean(Y);
    const ss_tot = Y.reduce((acc, y) => acc + Math.pow(y - y_mean, 2), 0);
    const ss_res = Y.reduce((acc, y, i) => acc + Math.pow(y - predictions[i], 2), 0);
    const r_squared = ss_tot === 0 ? 0 : 1 - (ss_res / ss_tot);

    return {
        coefficients: coefficients, // [intercept, b1, b2, ... bn]
        predictions: predictions,
        r_squared: r_squared
    };
}
