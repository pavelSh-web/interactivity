static async loadLottie(priorityUrl: string, urls: string[] = []) {
    const fetchLottie = async(url: string) => {
        let fileName = url.substr(url.lastIndexOf('/') + 1);
        fileName = fileName.substr(0, fileName.lastIndexOf('.json'));

        if (this.loadedLotties.includes(fileName)) {
            return url;
        }

        await fetch(url);

        this.loadedLotties.push(fileName);

        return url;
    }

    await fetchLottie(priorityUrl);

    urls.forEach(url => fetchLottie(url));

    return true;
}

static async beforeStartAnimation(steps) {
    const priorityUrl = steps.find(step => step.isActive)?.animationParams.path;
    const urls = steps.filter(step => !step.isActive).map(step => step.animationParams.path);

    await this.loadLottie(priorityUrl, urls);
}