import React, { useState, useEffect } from "react";
import { Typography, Card, CardContent, Grid, Avatar, Button, Link, TextField, MenuItem } from "@mui/material";
import md5 from "md5";
import { useTranslation } from "react-i18next";
import { API_URL } from "./Main";

export const models = {
    "gemini-1.5-pro-preview-0409": ["image", "audio", "video", "document", "tools"],
    "gemini-experimental": ["image", "audio", "video", "document", "tools"],
    "gemini-1.0-pro": ["document", "tools"],
    "claude-3-haiku-20240307": ["image", "document", "tools"],
    "claude-3-sonnet-20240229": ["image", "document", "tools"],
    "claude-3-opus-20240229": ["image", "document", "tools"],
    "gpt-3.5-turbo": ["document"],
    "gpt-4-turbo": ["document"],
    "databricks/dbrx-instruct": ["document"],
    "mistralai/Mixtral-8x22B-Instruct-v0.1": ["document"],
    "microsoft/WizardLM-2-8x22B": ["document"],
    "meta-llama/Llama-3-70b-chat-hf": ["document"],
};

const Settings = ({ user, handleCancelSubscription, handleCloseSettingsModal, selectedModel, onModelSelect }) => {
    const { t } = useTranslation();
    const gravatarUrl = `https://www.gravatar.com/avatar/${md5(user.email.toLowerCase())}?d=identicon`;
    const [apiKey, setApiKey] = useState("");

    const [customGPTNames, setCustomGPTNames] = useState([]);
    const [selectedCustomGPT, setSelectedCustomGPT] = useState("");

    const handleApiKeyChange = (event) => {
        setApiKey(event.target.value);
    };

    const handleModelChange = (event) => {
        onModelSelect(event.target.value);
    };

    const handleCustomGPTChange = (event) => {
        setSelectedCustomGPT(event.target.value);
    };

    useEffect(() => {
        const storedApiKey = localStorage.getItem("apiKey");
        const storedCustomGPT = localStorage.getItem("selectedCustomGPT");
        if (storedApiKey) setApiKey(storedApiKey);
        if (storedCustomGPT) setSelectedCustomGPT(storedCustomGPT);
        fetchCustomGPTNames();
    }, []);

    useEffect(() => {
        localStorage.setItem("apiKey", apiKey);
        localStorage.setItem("selectedCustomGPT", selectedCustomGPT);
    }, [apiKey, selectedCustomGPT]);

    const fetchCustomGPTNames = async () => {
        try {
            const response = await fetch(API_URL + "/customgpt");
            const data = await response.json();
            setCustomGPTNames(data);
        } catch {}
    };

    return (
        <>
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 800,
                    backgroundImage: "linear-gradient(135deg,#9ce1ba, #68988e)",
                    borderRadius: "8px",
                }}
            >
                <CardContent sx={{ padding: "1rem" }}>
                    <Grid container spacing={1}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                {t("Email")}
                            </Typography>
                            <Typography variant="body1" color="#fff">
                                {user.email}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Avatar
                                src={gravatarUrl}
                                alt={user.name}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    marginTop: "1rem",
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                {t("Subscription Status")}
                            </Typography>
                            <Typography variant="body1" color="#fff">
                                {user?.subscriptionStatus?.toUpperCase()}
                            </Typography>
                            {user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing" ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ mt: 1 }}
                                        onClick={handleCancelSubscription}
                                    >
                                        {t("Cancel Subscription")}
                                    </Button>
                                    <Link
                                        href={
                                            "https://billing.stripe.com/p/login/9AQ8zd8ZL79E51e000?prefilled_email=" +
                                            user.email
                                        }
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        <Button
                                            onClick={handleCloseSettingsModal}
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 1 }}
                                        >
                                            {t("Customer Portal")}
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={"https://buy.stripe.com/28oaGDclzeEfgUgcMM?prefilled_email=" + user.email}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    <Button
                                        onClick={handleCloseSettingsModal}
                                        variant="contained"
                                        color="primary"
                                        sx={{ mt: 1 }}
                                    >
                                        {t("Start Subscription")}
                                    </Button>
                                </Link>
                            )}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                {t("Select Model")}
                            </Typography>
                            <TextField
                                value={selectedModel}
                                onChange={handleModelChange}
                                fullWidth
                                select
                                variant="outlined"
                                color="secondary"
                            >
                                {Object.keys(models).map((model) => (
                                    <MenuItem key={model} value={model}>
                                        {model}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                {t("Select Custom GPT")}
                            </Typography>
                            <TextField
                                value={selectedCustomGPT}
                                onChange={handleCustomGPTChange}
                                fullWidth
                                select
                                variant="outlined"
                                color="secondary"
                            >
                                <MenuItem value="">None</MenuItem>
                                {customGPTNames.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                {t("Your API Key")}
                            </Typography>
                            <TextField
                                value={apiKey}
                                onChange={handleApiKeyChange}
                                fullWidth
                                variant="outlined"
                                color="secondary"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                {t("Gemini Pro Usage")}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body1" color="#fff">
                                        {t("Input Tokens:")}
                                    </Typography>
                                    <Typography variant="body2" color="#fff">
                                        <b>{user.usageStats.gemini.inputTokens}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1" color="#fff">
                                        {t("Output Tokens:")}
                                    </Typography>
                                    <Typography variant="body2" color="#fff">
                                        <b>{user.usageStats.gemini.outputTokens}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1" color="#fff">
                                        {t("Images Generated:")}
                                    </Typography>
                                    <Typography variant="body2" color="#fff">
                                        <b>{user.usageStats.gemini.imagesGenerated}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1" color="#fff">
                                        {t("Money Consumed:")}
                                    </Typography>
                                    <Typography variant="body2" color="#fff">
                                        <b>${user.usageStats.gemini.moneyConsumed.toFixed(2)}</b>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="secondary">
                                {t("Claude 3 Haiku Usage")}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body1" color="#fff">
                                        {t("Input Tokens:")}
                                    </Typography>
                                    <Typography variant="body2" color="#fff">
                                        <b>{user.usageStats.claude.inputTokens}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1" color="#fff">
                                        {t("Output Tokens:")}
                                    </Typography>
                                    <Typography variant="body2" color="#fff">
                                        <b>{user.usageStats.claude.outputTokens}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body1" color="#fff">
                                        {t("Money Consumed:")}
                                    </Typography>
                                    <Typography variant="body2" color="#fff">
                                        <b>${user.usageStats.claude.moneyConsumed.toFixed(2)}</b>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
};

export default Settings;
